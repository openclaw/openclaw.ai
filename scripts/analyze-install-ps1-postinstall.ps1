# Analyze Windows post-install readiness for OpenClaw.
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\analyze-install-ps1-postinstall.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\analyze-install-ps1-postinstall.ps1 -Json

param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

function Get-NpmCommandPath {
    $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($npmCmd -and $npmCmd.Source) { return $npmCmd.Source }
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm -and $npm.Source) { return $npm.Source }
    return $null
}

function Invoke-NpmCommand {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    $npmPath = Get-NpmCommandPath
    if (-not $npmPath) {
        throw "npm command not found on PATH."
    }
    & $npmPath @Arguments
}

function Get-NpmPrefixCandidates {
    $prefixes = New-Object System.Collections.Generic.List[string]
    try {
        $prefixFromPrefix = (Invoke-NpmCommand prefix -g 2>$null).Trim()
        if (-not [string]::IsNullOrWhiteSpace($prefixFromPrefix) -and $prefixFromPrefix -ne "undefined" -and $prefixFromPrefix -ne "null") {
            $prefixes.Add($prefixFromPrefix)
        }
    } catch {}

    try {
        $prefixFromConfig = (Invoke-NpmCommand config get prefix 2>$null).Trim()
        if (-not [string]::IsNullOrWhiteSpace($prefixFromConfig) -and $prefixFromConfig -ne "undefined" -and $prefixFromConfig -ne "null") {
            $prefixes.Add($prefixFromConfig)
        }
    } catch {}

    return $prefixes | Select-Object -Unique
}

function Get-OpenClawBinCandidates {
    $dirs = New-Object System.Collections.Generic.List[string]
    foreach ($prefix in (Get-NpmPrefixCandidates)) {
        $dirs.Add($prefix)
        $dirs.Add((Join-Path $prefix "bin"))
    }
    if (-not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
        $dirs.Add((Join-Path $env:APPDATA "npm"))
    }
    if (-not [string]::IsNullOrWhiteSpace($env:USERPROFILE)) {
        $dirs.Add((Join-Path $env:USERPROFILE ".local\\bin"))
    }
    return $dirs | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
}

function Resolve-ShimTarget {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ShimPath
    )

    $shimDir = Split-Path -Parent $ShimPath
    $contents = $null
    try {
        $contents = Get-Content -Path $ShimPath -Raw
    } catch {
        return $null
    }

    if ($contents -and $contents -match '%dp0%\\(node_modules\\openclaw\\openclaw\.mjs)') {
        return (Join-Path $shimDir $Matches[1])
    }
    if ($contents -and $contents -match 'node\s+"([^"]*dist\\entry\.js)"') {
        return $Matches[1]
    }
    return $null
}

function Get-ExecutionPolicyMap {
    $policyMap = [ordered]@{}
    foreach ($entry in (Get-ExecutionPolicy -List)) {
        $policyMap[$entry.Scope.ToString()] = $entry.ExecutionPolicy.ToString()
    }
    return [pscustomobject]$policyMap
}

$issues = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]
$pathEntries = $env:Path -split ";" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
$prefixes = @(Get-NpmPrefixCandidates)
$binCandidates = @(Get-OpenClawBinCandidates)

$resolvedOpenClaw = Get-Command openclaw -ErrorAction SilentlyContinue
$resolvedOpenClawCmd = Get-Command openclaw.cmd -ErrorAction SilentlyContinue

$shimReports = @()
foreach ($dir in $binCandidates) {
    $shimPath = Join-Path $dir "openclaw.cmd"
    if (-not (Test-Path $shimPath)) {
        continue
    }

    $targetPath = Resolve-ShimTarget -ShimPath $shimPath
    $targetExists = $false
    if ($targetPath) {
        $targetExists = Test-Path $targetPath
    }

    $shimReports += [pscustomobject]@{
        shimPath = $shimPath
        shimDir = $dir
        targetPath = $targetPath
        targetExists = $targetExists
        shimDirInPath = ($pathEntries | Where-Object { $_.Trim() -ieq $dir }).Count -gt 0
    }
}

if ($shimReports.Count -eq 0) {
    $issues.Add("No openclaw.cmd shim found in expected global bin locations.")
}

foreach ($shim in $shimReports) {
    if (-not $shim.targetPath) {
        $warnings.Add("Could not parse target path from shim: $($shim.shimPath)")
        continue
    }
    if (-not $shim.targetExists) {
        $issues.Add("Shim target missing: $($shim.targetPath)")
    }
}

if ($shimReports.Count -gt 0 -and (($shimReports | Where-Object { $_.shimDirInPath }).Count -eq 0)) {
    $warnings.Add("Shim exists but its directory is not on current PATH.")
}

$effectivePolicy = (Get-ExecutionPolicy).ToString()
if ($resolvedOpenClaw -and $resolvedOpenClaw.Source -like "*.ps1" -and $effectivePolicy -eq "Restricted") {
    $issues.Add("PowerShell resolves openclaw to a .ps1 shim while execution policy is Restricted.")
}

foreach ($prefix in $prefixes) {
    $rootShim = Join-Path $prefix "openclaw.cmd"
    $binShim = Join-Path (Join-Path $prefix "bin") "openclaw.cmd"
    if ((Test-Path $rootShim) -and -not (Test-Path $binShim)) {
        $warnings.Add("Found shim at prefix root ($rootShim) but not in <prefix>\\bin. Installers must check both.")
    }
}

$report = [pscustomobject]@{
    timestamp = (Get-Date).ToString("o")
    executionPolicy = Get-ExecutionPolicyMap
    npm = [pscustomobject]@{
        commandPath = Get-NpmCommandPath
        prefixes = $prefixes
    }
    commandResolution = [pscustomobject]@{
        openclaw = if ($resolvedOpenClaw) { $resolvedOpenClaw.Source } else { $null }
        openclawCmd = if ($resolvedOpenClawCmd) { $resolvedOpenClawCmd.Source } else { $null }
    }
    binCandidates = $binCandidates
    shims = $shimReports
    issues = @($issues)
    warnings = @($warnings)
    healthy = ($issues.Count -eq 0)
}

if ($Json) {
    $report | ConvertTo-Json -Depth 8
} else {
    Write-Host "OpenClaw install post-check" -ForegroundColor Cyan
    Write-Host "Healthy: $($report.healthy)" -ForegroundColor $(if ($report.healthy) { "Green" } else { "Yellow" })
    Write-Host "npm path: $($report.npm.commandPath)" -ForegroundColor Gray
    if ($report.commandResolution.openclawCmd) {
        Write-Host "openclaw.cmd: $($report.commandResolution.openclawCmd)" -ForegroundColor Gray
    }
    if ($report.commandResolution.openclaw) {
        Write-Host "openclaw: $($report.commandResolution.openclaw)" -ForegroundColor Gray
    }
    if ($report.issues.Count -gt 0) {
        Write-Host ""
        Write-Host "Issues:" -ForegroundColor Red
        foreach ($issue in $report.issues) {
            Write-Host " - $issue" -ForegroundColor Red
        }
    }
    if ($report.warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Warnings:" -ForegroundColor Yellow
        foreach ($warning in $report.warnings) {
            Write-Host " - $warning" -ForegroundColor Yellow
        }
    }
}

if (-not $report.healthy) {
    exit 1
}

exit 0
