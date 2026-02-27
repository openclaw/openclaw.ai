# OpenClaw Installer for Windows
# Usage: iwr -useb https://openclaw.ai/install.ps1 | iex
#        & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -Tag beta -NoOnboard -DryRun

param(
    [string]$Tag = "latest",
    [ValidateSet("npm", "git")]
    [string]$InstallMethod = "npm",
    [string]$GitDir,
    [switch]$NoOnboard,
    [switch]$NoGitUpdate,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  OpenClaw Installer" -ForegroundColor Cyan
Write-Host ""

# Check if running in PowerShell
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "Error: PowerShell 5+ required" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Windows detected" -ForegroundColor Green

if (-not $PSBoundParameters.ContainsKey("InstallMethod")) {
    if (-not [string]::IsNullOrWhiteSpace($env:OPENCLAW_INSTALL_METHOD)) {
        $InstallMethod = $env:OPENCLAW_INSTALL_METHOD
    }
}
if (-not $PSBoundParameters.ContainsKey("GitDir")) {
    if (-not [string]::IsNullOrWhiteSpace($env:OPENCLAW_GIT_DIR)) {
        $GitDir = $env:OPENCLAW_GIT_DIR
    }
}
if (-not $PSBoundParameters.ContainsKey("NoOnboard")) {
    if ($env:OPENCLAW_NO_ONBOARD -eq "1") {
        $NoOnboard = $true
    }
}
if (-not $PSBoundParameters.ContainsKey("NoGitUpdate")) {
    if ($env:OPENCLAW_GIT_UPDATE -eq "0") {
        $NoGitUpdate = $true
    }
}
if (-not $PSBoundParameters.ContainsKey("DryRun")) {
    if ($env:OPENCLAW_DRY_RUN -eq "1") {
        $DryRun = $true
    }
}

if ([string]::IsNullOrWhiteSpace($GitDir)) {
    $userHome = [Environment]::GetFolderPath("UserProfile")
    $GitDir = (Join-Path $userHome "openclaw")
}

# Check for Node.js
function Check-Node {
    try {
        $nodeVersion = (node -v 2>$null)
        if ($nodeVersion) {
            $version = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
            if ($version -ge 22) {
                Write-Host "[OK] Node.js $nodeVersion found" -ForegroundColor Green
                return $true
            } else {
                Write-Host "[!] Node.js $nodeVersion found, but v22+ required" -ForegroundColor Yellow
                return $false
            }
        }
    } catch {
        Write-Host "[!] Node.js not found" -ForegroundColor Yellow
        return $false
    }
    return $false
}

# Install Node.js
function Install-Node {
    Write-Host "[*] Installing Node.js..." -ForegroundColor Yellow

    # Try winget first (Windows 11 / Windows 10 with App Installer)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "  Using winget..." -ForegroundColor Gray
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-Host "[OK] Node.js installed via winget" -ForegroundColor Green
        return
    }

    # Try Chocolatey
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "  Using Chocolatey..." -ForegroundColor Gray
        choco install nodejs-lts -y

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-Host "[OK] Node.js installed via Chocolatey" -ForegroundColor Green
        return
    }

    # Try Scoop
    if (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "  Using Scoop..." -ForegroundColor Gray
        scoop install nodejs-lts
        Write-Host "[OK] Node.js installed via Scoop" -ForegroundColor Green
        return
    }

    # Manual download fallback
    Write-Host ""
    Write-Host "Error: Could not find a package manager (winget, choco, or scoop)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js 22+ manually:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install winget (App Installer) from the Microsoft Store." -ForegroundColor Gray
    exit 1
}

# Check for existing OpenClaw installation
function Check-ExistingOpenClaw {
    $diagnosis = Get-OpenClawPostInstallDiagnosis
    if ($diagnosis.IsHealthy) {
        Write-Host "[*] Existing OpenClaw installation detected" -ForegroundColor Yellow
        return $true
    }
    return $false
}

function Check-BrokenOpenClawArtifacts {
    $diagnosis = Get-OpenClawPostInstallDiagnosis
    if ($diagnosis.IsHealthy) {
        return $false
    }

    if ($diagnosis.MissingTargetPaths -and $diagnosis.MissingTargetPaths.Count -gt 0) {
        Write-Host "[*] Existing OpenClaw install artifacts detected (repair mode)" -ForegroundColor Yellow
        return $true
    }

    if ($diagnosis.OpenClawCmdPath) {
        Write-Host "[*] Existing OpenClaw launcher detected but not healthy (repair mode)" -ForegroundColor Yellow
        return $true
    }

    return $false
}

function Check-Git {
    try {
        $null = Get-Command git -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Require-Git {
    if (Check-Git) { return }
    Write-Host ""
    Write-Host "Error: Git is required for --InstallMethod git." -ForegroundColor Red
    Write-Host "Install Git for Windows:" -ForegroundColor Yellow
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "Then re-run this installer." -ForegroundColor Yellow
    exit 1
}

function Get-NpmCommandPath {
    $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($npmCmd -and $npmCmd.Source) {
        return $npmCmd.Source
    }
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm -and $npm.Source) {
        return $npm.Source
    }
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
    $candidates = New-Object System.Collections.Generic.List[string]
    try {
        $prefixFromNpmPrefix = (Invoke-NpmCommand prefix -g 2>$null).Trim()
        if (-not [string]::IsNullOrWhiteSpace($prefixFromNpmPrefix) -and $prefixFromNpmPrefix -ne "undefined" -and $prefixFromNpmPrefix -ne "null") {
            $candidates.Add($prefixFromNpmPrefix)
        }
    } catch {}

    try {
        $prefixFromConfig = (Invoke-NpmCommand config get prefix 2>$null).Trim()
        if (-not [string]::IsNullOrWhiteSpace($prefixFromConfig) -and $prefixFromConfig -ne "undefined" -and $prefixFromConfig -ne "null") {
            $candidates.Add($prefixFromConfig)
        }
    } catch {}

    return $candidates | Select-Object -Unique
}

function Get-OpenClawBinCandidates {
    $dirs = New-Object System.Collections.Generic.List[string]

    foreach ($prefix in (Get-NpmPrefixCandidates)) {
        if (-not [string]::IsNullOrWhiteSpace($prefix)) {
            $dirs.Add($prefix)
            $dirs.Add((Join-Path $prefix "bin"))
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
        $dirs.Add((Join-Path $env:APPDATA "npm"))
    }
    if (-not [string]::IsNullOrWhiteSpace($env:USERPROFILE)) {
        $dirs.Add((Join-Path $env:USERPROFILE ".local\\bin"))
    }

    return $dirs | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
}

function Resolve-OpenClawCmdPath {
    $cmdFromPath = Get-Command openclaw.cmd -ErrorAction SilentlyContinue
    if ($cmdFromPath -and $cmdFromPath.Source) {
        return $cmdFromPath.Source
    }

    foreach ($dir in (Get-OpenClawBinCandidates)) {
        $candidate = Join-Path $dir "openclaw.cmd"
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

function Invoke-OpenClawCommand {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    $cmdPath = Resolve-OpenClawCmdPath
    if (-not $cmdPath) {
        throw "openclaw.cmd not found."
    }

    & $cmdPath @Arguments
}

function Get-OpenClawPostInstallDiagnosis {
    $diagnosis = [ordered]@{
        OpenClawCmdPath         = Resolve-OpenClawCmdPath
        NpmPath                 = Get-NpmCommandPath
        NpmPrefixes             = @(Get-NpmPrefixCandidates)
        CandidateBinDirs        = @(Get-OpenClawBinCandidates)
        FoundShimPaths          = @()
        MissingTargetPaths      = @()
        IsHealthy               = $false
        Summary                 = $null
    }

    foreach ($dir in $diagnosis.CandidateBinDirs) {
        $shimPath = Join-Path $dir "openclaw.cmd"
        if (-not (Test-Path $shimPath)) {
            continue
        }
        $diagnosis.FoundShimPaths += $shimPath

    }

    if (-not $diagnosis.OpenClawCmdPath) {
        $diagnosis.Summary = "openclaw.cmd launcher was not found in npm global install locations."
        return [pscustomobject]$diagnosis
    }

    $cmdDir = Split-Path -Parent $diagnosis.OpenClawCmdPath
    $shimContents = $null
    try {
        $shimContents = Get-Content -Path $diagnosis.OpenClawCmdPath -Raw
    } catch {
        $shimContents = $null
    }

    $expectedTarget = $null
    if ($shimContents) {
        $pathMatch = [regex]::Match(
            $shimContents,
            '"(?<target>(?:(?:%~?dp0%?)[\\/])?[^"\r\n]*(?:node_modules[\\/]openclaw[\\/]openclaw\.mjs|dist[\\/]entry\.js))"',
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
        if ($pathMatch.Success) {
            $rawTarget = $pathMatch.Groups["target"].Value
            if ($rawTarget -match '^%~?dp0%?[\\/](.+)$') {
                $expectedTarget = Join-Path $cmdDir $Matches[1]
            } elseif ([System.IO.Path]::IsPathRooted($rawTarget)) {
                $expectedTarget = $rawTarget
            } else {
                $expectedTarget = Join-Path $cmdDir $rawTarget
            }
        }
    }

    if (-not $expectedTarget) {
        $diagnosis.Summary = "openclaw.cmd exists but its launcher target could not be parsed."
        return [pscustomobject]$diagnosis
    }

    if (-not (Test-Path $expectedTarget)) {
        $diagnosis.MissingTargetPaths += $expectedTarget
        $diagnosis.Summary = "openclaw.cmd exists but its target is missing: $expectedTarget."
        return [pscustomobject]$diagnosis
    }

    $diagnosis.IsHealthy = $true
    $diagnosis.Summary = "openclaw.cmd launcher and target were found."
    return [pscustomobject]$diagnosis
}

function Add-DirToUserPath {
    param(
        [string]$Dir
    )

    if ([string]::IsNullOrWhiteSpace($Dir)) {
        return $false
    }

    $candidate = $Dir.Trim()
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ([string]::IsNullOrWhiteSpace($userPath)) {
        $userPath = ""
    }

    $alreadyPresent = $userPath -split ";" | Where-Object { $_ -and $_.Trim() -ieq $candidate }
    if ($alreadyPresent) {
        return $false
    }

    $newUserPath = if ([string]::IsNullOrWhiteSpace($userPath)) { $candidate } else { "$userPath;$candidate" }
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    return $true
}

function Ensure-OpenClawOnPath {
    $diagnosis = Get-OpenClawPostInstallDiagnosis
    if ($diagnosis.IsHealthy) {
        $launcherDir = Split-Path -Parent $diagnosis.OpenClawCmdPath
        if (Add-DirToUserPath -Dir $launcherDir) {
            Write-Host "[!] Added $launcherDir to user PATH (restart terminal if command not found)" -ForegroundColor Yellow
        }
        return $true
    }

    foreach ($npmBin in $diagnosis.CandidateBinDirs) {
        if (-not (Test-Path (Join-Path $npmBin "openclaw.cmd"))) {
            continue
        }
        if (Add-DirToUserPath -Dir $npmBin) {
            Write-Host "[!] Added $npmBin to user PATH (restart terminal if command not found)" -ForegroundColor Yellow
        }
    }

    $diagnosis = Get-OpenClawPostInstallDiagnosis
    if ($diagnosis.IsHealthy) {
        return $true
    }

    if ($diagnosis.Summary) {
        Write-Host "[!] $($diagnosis.Summary)" -ForegroundColor Yellow
    }
    if ($diagnosis.NpmPrefixes.Count -gt 0) {
        Write-Host "npm prefix candidates:" -ForegroundColor Gray
        foreach ($prefix in $diagnosis.NpmPrefixes) {
            Write-Host "  - $prefix" -ForegroundColor Gray
        }
    }
    if ($diagnosis.CandidateBinDirs.Count -gt 0) {
        Write-Host "Searched launcher dirs:" -ForegroundColor Gray
        foreach ($dir in $diagnosis.CandidateBinDirs) {
            Write-Host "  - $dir" -ForegroundColor Gray
        }
    }
    if ($diagnosis.FoundShimPaths.Count -gt 0) {
        Write-Host "Found shim files:" -ForegroundColor Gray
        foreach ($shim in $diagnosis.FoundShimPaths) {
            Write-Host "  - $shim" -ForegroundColor Gray
        }
    }
    if ($diagnosis.MissingTargetPaths.Count -gt 0) {
        Write-Host "[!] Incomplete install detected (launcher target missing):" -ForegroundColor Yellow
        foreach ($missing in $diagnosis.MissingTargetPaths) {
            Write-Host "  - $missing" -ForegroundColor Yellow
        }
    }

    Write-Host "[!] openclaw is not on PATH yet." -ForegroundColor Yellow
    Write-Host "Restart PowerShell or add the npm global install folder to PATH." -ForegroundColor Yellow
    if ($diagnosis.NpmPrefixes.Count -gt 0) {
        Write-Host "Common fix (most Windows installs): add this to PATH if needed:" -ForegroundColor Gray
        Write-Host "  $($diagnosis.NpmPrefixes[0])" -ForegroundColor Cyan
    } else {
        Write-Host "Hint: run \"npm config get prefix\" to find your npm global path." -ForegroundColor Gray
    }
    return $false
}

function Repair-OpenClawNpmInstall {
    param(
        [string]$Tag = "latest"
    )

    Write-Host "[*] Repairing OpenClaw global install..." -ForegroundColor Yellow
    try {
        Invoke-NpmCommand uninstall -g openclaw | Out-Null
    } catch {
        # Continue: uninstall can fail if package is already partially broken.
    }

    $repairOutput = Invoke-NpmCommand install -g "openclaw@$Tag" "--force" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Repair install failed" -ForegroundColor Red
        $repairOutput | ForEach-Object { Write-Host $_ }
        return $false
    }

    if (Ensure-OpenClawOnPath) {
        Write-Host "[OK] OpenClaw install repaired" -ForegroundColor Green
        return $true
    }

    Write-Host "[!] Repair completed but launcher validation still failed." -ForegroundColor Yellow
    return $false
}

function Ensure-OpenClawReadyAfterInstall {
    param(
        [string]$Tag = "latest"
    )

    if (Ensure-OpenClawOnPath) {
        return $true
    }

    Write-Host "[!] Post-install validation failed; retrying with forced reinstall..." -ForegroundColor Yellow
    if (-not (Repair-OpenClawNpmInstall -Tag $Tag)) {
        return $false
    }

    return (Ensure-OpenClawOnPath)
}

function Get-PersistentExecutionPolicy {
    try {
        $list = Get-ExecutionPolicy -List
    } catch {
        return $null
    }

    foreach ($scope in @("MachinePolicy", "UserPolicy", "CurrentUser", "LocalMachine")) {
        $entry = $list | Where-Object { $_.Scope.ToString() -eq $scope } | Select-Object -First 1
        if (-not $entry) { continue }
        $value = $entry.ExecutionPolicy.ToString()
        if ($value -and $value -ne "Undefined") {
            return $value
        }
    }

    return "Undefined"
}

function Warn-OpenClawPowerShellPolicy {
    $cmdPath = Resolve-OpenClawCmdPath
    if (-not $cmdPath) {
        return
    }

    $resolved = Get-Command openclaw -ErrorAction SilentlyContinue
    if (-not $resolved -or -not $resolved.Source -or $resolved.Source -notlike "*.ps1") {
        return
    }

    $persistentPolicy = Get-PersistentExecutionPolicy
    if ($persistentPolicy -ne "Restricted") {
        return
    }

    Write-Host "[!] PowerShell policy is Restricted and openclaw resolves to a .ps1 shim." -ForegroundColor Yellow
    Write-Host "Use openclaw.cmd, or set a user policy if desired:" -ForegroundColor Gray
    Write-Host "  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned" -ForegroundColor Cyan
}

function Ensure-Pnpm {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        return
    }
    if (Get-Command corepack -ErrorAction SilentlyContinue) {
        try {
            corepack enable | Out-Null
            corepack prepare pnpm@latest --activate | Out-Null
            if (Get-Command pnpm -ErrorAction SilentlyContinue) {
                Write-Host "[OK] pnpm installed via corepack" -ForegroundColor Green
                return
            }
        } catch {
            # fallthrough to npm install
        }
    }
    Write-Host "[*] Installing pnpm..." -ForegroundColor Yellow
    Invoke-NpmCommand install -g pnpm
    Write-Host "[OK] pnpm installed" -ForegroundColor Green
}

# Install OpenClaw
function Install-OpenClaw {
    if ([string]::IsNullOrWhiteSpace($Tag)) {
        $Tag = "latest"
    }
    # Use openclaw package for beta, openclaw for stable
    $packageName = "openclaw"
    if ($Tag -eq "beta" -or $Tag -match "^beta\.") {
        $packageName = "openclaw"
    }
    Write-Host "[*] Installing OpenClaw ($packageName@$Tag)..." -ForegroundColor Yellow
    $prevLogLevel = $env:NPM_CONFIG_LOGLEVEL
    $prevUpdateNotifier = $env:NPM_CONFIG_UPDATE_NOTIFIER
    $prevFund = $env:NPM_CONFIG_FUND
    $prevAudit = $env:NPM_CONFIG_AUDIT
    $env:NPM_CONFIG_LOGLEVEL = "error"
    $env:NPM_CONFIG_UPDATE_NOTIFIER = "false"
    $env:NPM_CONFIG_FUND = "false"
    $env:NPM_CONFIG_AUDIT = "false"
    try {
        $npmOutput = Invoke-NpmCommand install -g "$packageName@$Tag" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[!] npm install failed" -ForegroundColor Red
            if ($npmOutput -match "spawn git" -or $npmOutput -match "ENOENT.*git") {
                Write-Host "Error: git is missing from PATH." -ForegroundColor Red
                Write-Host "Install Git for Windows, then reopen PowerShell and retry:" -ForegroundColor Yellow
                Write-Host "  https://git-scm.com/download/win" -ForegroundColor Cyan
            } else {
                Write-Host "Re-run with verbose output to see the full error:" -ForegroundColor Yellow
                Write-Host "  iwr -useb https://openclaw.ai/install.ps1 | iex" -ForegroundColor Cyan
            }
            $npmOutput | ForEach-Object { Write-Host $_ }
            exit 1
        }
    } finally {
        $env:NPM_CONFIG_LOGLEVEL = $prevLogLevel
        $env:NPM_CONFIG_UPDATE_NOTIFIER = $prevUpdateNotifier
        $env:NPM_CONFIG_FUND = $prevFund
        $env:NPM_CONFIG_AUDIT = $prevAudit
    }
    Write-Host "[OK] OpenClaw installed" -ForegroundColor Green
}

# Install OpenClaw from GitHub
function Install-OpenClawFromGit {
    param(
        [string]$RepoDir,
        [switch]$SkipUpdate
    )
    Require-Git
    Ensure-Pnpm

    $repoUrl = "https://github.com/openclaw/openclaw.git"
    Write-Host "[*] Installing OpenClaw from GitHub ($repoUrl)..." -ForegroundColor Yellow

    if (-not (Test-Path $RepoDir)) {
        git clone $repoUrl $RepoDir
    }

    if (-not $SkipUpdate) {
        if (-not (git -C $RepoDir status --porcelain 2>$null)) {
            git -C $RepoDir pull --rebase 2>$null
        } else {
            Write-Host "[!] Repo is dirty; skipping git pull" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[!] Git update disabled; skipping git pull" -ForegroundColor Yellow
    }

    Remove-LegacySubmodule -RepoDir $RepoDir

    pnpm -C $RepoDir install
    if (-not (pnpm -C $RepoDir ui:build)) {
        Write-Host "[!] UI build failed; continuing (CLI may still work)" -ForegroundColor Yellow
    }
    pnpm -C $RepoDir build

    $binDir = Join-Path $env:USERPROFILE ".local\\bin"
    if (-not (Test-Path $binDir)) {
        New-Item -ItemType Directory -Force -Path $binDir | Out-Null
    }
    $cmdPath = Join-Path $binDir "openclaw.cmd"
    $cmdContents = "@echo off`r`nnode ""$RepoDir\\dist\\entry.js"" %*`r`n"
    Set-Content -Path $cmdPath -Value $cmdContents -NoNewline

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not ($userPath -split ";" | Where-Object { $_ -ieq $binDir })) {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$binDir", "User")
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-Host "[!] Added $binDir to user PATH (restart terminal if command not found)" -ForegroundColor Yellow
    }

    Write-Host "[OK] OpenClaw wrapper installed to $cmdPath" -ForegroundColor Green
    Write-Host "[i] This checkout uses pnpm. For deps, run: pnpm install (avoid npm install in the repo)." -ForegroundColor Gray
}

# Run doctor for migrations (safe, non-interactive)
function Run-Doctor {
    Write-Host "[*] Running doctor to migrate settings..." -ForegroundColor Yellow
    try {
        Invoke-OpenClawCommand doctor --non-interactive
    } catch {
        # Ignore errors from doctor
    }
    Write-Host "[OK] Migration complete" -ForegroundColor Green
}

function Test-GatewayServiceLoaded {
    try {
        $statusJson = (Invoke-OpenClawCommand daemon status --json 2>$null)
        if ([string]::IsNullOrWhiteSpace($statusJson)) {
            return $false
        }
        $parsed = $statusJson | ConvertFrom-Json
        if ($parsed -and $parsed.service -and $parsed.service.loaded) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Refresh-GatewayServiceIfLoaded {
    if (-not (Resolve-OpenClawCmdPath)) {
        return
    }
    if (-not (Test-GatewayServiceLoaded)) {
        return
    }

    Write-Host "[*] Refreshing loaded gateway service..." -ForegroundColor Yellow
    try {
        Invoke-OpenClawCommand gateway install --force | Out-Null
    } catch {
        Write-Host "[!] Gateway service refresh failed; continuing." -ForegroundColor Yellow
        return
    }

    try {
        Invoke-OpenClawCommand gateway restart | Out-Null
        Invoke-OpenClawCommand gateway status --probe --json | Out-Null
        Write-Host "[OK] Gateway service refreshed" -ForegroundColor Green
    } catch {
        Write-Host "[!] Gateway service restart failed; continuing." -ForegroundColor Yellow
    }
}

function Get-LegacyRepoDir {
    if (-not [string]::IsNullOrWhiteSpace($env:OPENCLAW_GIT_DIR)) {
        return $env:OPENCLAW_GIT_DIR
    }
    $userHome = [Environment]::GetFolderPath("UserProfile")
    return (Join-Path $userHome "openclaw")
}

function Remove-LegacySubmodule {
    param(
        [string]$RepoDir
    )
    if ([string]::IsNullOrWhiteSpace($RepoDir)) {
        $RepoDir = Get-LegacyRepoDir
    }
    $legacyDir = Join-Path $RepoDir "Peekaboo"
    if (Test-Path $legacyDir) {
        Write-Host "[!] Removing legacy submodule checkout: $legacyDir" -ForegroundColor Yellow
        Remove-Item -Recurse -Force $legacyDir
    }
}

# Main installation flow
function Main {
    if ($InstallMethod -ne "npm" -and $InstallMethod -ne "git") {
        Write-Host "Error: invalid -InstallMethod (use npm or git)." -ForegroundColor Red
        exit 2
    }

    if ($DryRun) {
        Write-Host "[OK] Dry run" -ForegroundColor Green
        Write-Host "[OK] Install method: $InstallMethod" -ForegroundColor Green
        if ($InstallMethod -eq "git") {
            Write-Host "[OK] Git dir: $GitDir" -ForegroundColor Green
            if ($NoGitUpdate) {
                Write-Host "[OK] Git update: disabled" -ForegroundColor Green
            } else {
                Write-Host "[OK] Git update: enabled" -ForegroundColor Green
            }
        }
        if ($NoOnboard) {
            Write-Host "[OK] Onboard: skipped" -ForegroundColor Green
        }
        return
    }

    Remove-LegacySubmodule -RepoDir $RepoDir

    # Check for existing installation
    $isUpgrade = Check-ExistingOpenClaw
    $hasBrokenInstallArtifacts = Check-BrokenOpenClawArtifacts
    $treatAsUpgrade = $isUpgrade -or $hasBrokenInstallArtifacts

    # Step 1: Node.js
    if (-not (Check-Node)) {
        Install-Node

        # Verify installation
        if (-not (Check-Node)) {
            Write-Host ""
            Write-Host "Error: Node.js installation may require a terminal restart" -ForegroundColor Red
            Write-Host "Please close this terminal, open a new one, and run this installer again." -ForegroundColor Yellow
            exit 1
        }
    }

    $finalGitDir = $null

    # Step 2: OpenClaw
    if ($InstallMethod -eq "git") {
        $finalGitDir = $GitDir
        Install-OpenClawFromGit -RepoDir $GitDir -SkipUpdate:$NoGitUpdate
    } else {
        Install-OpenClaw
    }

    $postInstallReady = $false
    if ($InstallMethod -eq "npm") {
        $postInstallReady = Ensure-OpenClawReadyAfterInstall -Tag $Tag
    } else {
        $postInstallReady = Ensure-OpenClawOnPath
    }

    if (-not $postInstallReady) {
        Write-Host "Install completed, but OpenClaw is not on PATH yet." -ForegroundColor Yellow
        Write-Host "Open a new terminal, then run: openclaw doctor" -ForegroundColor Cyan
        return
    }
    Warn-OpenClawPowerShellPolicy

    Refresh-GatewayServiceIfLoaded

    # Step 3: Run doctor for migrations if upgrading, repairing prior artifacts, or git install
    if ($treatAsUpgrade -or $InstallMethod -eq "git") {
        Run-Doctor
    }

    $installedVersion = $null
    if ($InstallMethod -eq "git" -and $finalGitDir) {
        $gitPackageJson = Join-Path $finalGitDir "package.json"
        try {
            if (Test-Path $gitPackageJson) {
                $gitPackage = Get-Content $gitPackageJson -Raw | ConvertFrom-Json
                if ($gitPackage -and $gitPackage.version) {
                    $installedVersion = $gitPackage.version
                }
            }
        } catch {
            $installedVersion = $null
        }
    }
    if (-not $installedVersion) {
        try {
            $npmList = Invoke-NpmCommand list -g --depth 0 --json 2>$null | ConvertFrom-Json
            if ($npmList -and $npmList.dependencies -and $npmList.dependencies.openclaw -and $npmList.dependencies.openclaw.version) {
                $installedVersion = $npmList.dependencies.openclaw.version
            }
        } catch {
            $installedVersion = $null
        }
    }

    Write-Host ""
    if ($installedVersion) {
        Write-Host "OpenClaw installed successfully ($installedVersion)!" -ForegroundColor Green
    } else {
        Write-Host "OpenClaw installed successfully!" -ForegroundColor Green
    }
    Write-Host ""
    if ($treatAsUpgrade) {
        $updateMessages = @(
            "Leveled up! New skills unlocked. You're welcome.",
            "Fresh code, same lobster. Miss me?",
            "Back and better. Did you even notice I was gone?",
            "Update complete. I learned some new tricks while I was out.",
            "Upgraded! Now with 23% more sass.",
            "I've evolved. Try to keep up.",
            "New version, who dis? Oh right, still me but shinier.",
            "Patched, polished, and ready to pinch. Let's go.",
            "The lobster has molted. Harder shell, sharper claws.",
            "Update done! Check the changelog or just trust me, it's good.",
            "Reborn from the boiling waters of npm. Stronger now.",
            "I went away and came back smarter. You should try it sometime.",
            "Update complete. The bugs feared me, so they left.",
            "New version installed. Old version sends its regards.",
            "Firmware fresh. Brain wrinkles: increased.",
            "I've seen things you wouldn't believe. Anyway, I'm updated.",
            "Back online. The changelog is long but our friendship is longer.",
            "Upgraded! Peter fixed stuff. Blame him if it breaks.",
            "Molting complete. Please don't look at my soft shell phase.",
            "Version bump! Same chaos energy, fewer crashes (probably)."
        )
        Write-Host (Get-Random -InputObject $updateMessages) -ForegroundColor Gray
        Write-Host ""
    } else {
        $completionMessages = @(
            "Ahh nice, I like it here. Got any snacks? ",
            "Home sweet home. Don't worry, I won't rearrange the furniture.",
            "I'm in. Let's cause some responsible chaos.",
            "Installation complete. Your productivity is about to get weird.",
            "Settled in. Time to automate your life whether you're ready or not.",
            "Cozy. I've already read your calendar. We need to talk.",
            "Finally unpacked. Now point me at your problems.",
            "cracks claws Alright, what are we building?",
            "The lobster has landed. Your terminal will never be the same.",
            "All done! I promise to only judge your code a little bit."
        )
        Write-Host (Get-Random -InputObject $completionMessages) -ForegroundColor Gray
        Write-Host ""
    }

    if ($InstallMethod -eq "git") {
        Write-Host "Source checkout: $finalGitDir" -ForegroundColor Cyan
        Write-Host "Wrapper: $env:USERPROFILE\\.local\\bin\\openclaw.cmd" -ForegroundColor Cyan
        Write-Host ""
    }

    if ($treatAsUpgrade) {
        Write-Host "Upgrade complete. Run " -NoNewline
        Write-Host "openclaw doctor" -ForegroundColor Cyan -NoNewline
        Write-Host " to check for additional migrations."
    } else {
        if ($NoOnboard) {
            Write-Host "Skipping onboard (requested). Run " -NoNewline
            Write-Host "openclaw onboard" -ForegroundColor Cyan -NoNewline
            Write-Host " later."
        } else {
            Write-Host "Starting setup..." -ForegroundColor Cyan
            Write-Host ""
            Invoke-OpenClawCommand onboard
        }
    }
}

Main
