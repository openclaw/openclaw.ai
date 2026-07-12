import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siGmail, siGoogle, siGooglechrome, siX } from 'simple-icons';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readBytes(relativePath) {
  return readFileSync(repoPath(relativePath));
}

function readText(relativePath) {
  return readFileSync(repoPath(relativePath), 'utf8');
}

function listHtmlFiles(relativeDir) {
  return readdirSync(repoPath(relativeDir), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(relativePath);
    return relativePath.endsWith('.html') ? [relativePath] : [];
  });
}

function assertFileExists(relativePath) {
  assert.ok(existsSync(repoPath(relativePath)), `Expected ${relativePath} to exist`);
}

function assertCopiedByteForByte(sourcePath, builtPath) {
  assertFileExists(sourcePath);
  assertFileExists(builtPath);
  assert.ok(readBytes(builtPath).equals(readBytes(sourcePath)), `${builtPath} must match ${sourcePath}`);
}

function assertContains(text, expected, context) {
  assert.ok(text.includes(expected), `Expected ${context} to contain ${expected}`);
}

function assertJsonLdIsParseable(html, context) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, contents] of scripts) {
    assert.doesNotThrow(() => JSON.parse(contents), `${context} must contain parseable JSON-LD`);
  }
}

assertCopiedByteForByte('public/openclaw-logo-text-dark.png', 'dist/openclaw-logo-text-dark.png');
assertCopiedByteForByte('public/logo.png', 'dist/logo.png');
assertCopiedByteForByte('public/granola.png', 'dist/granola.png');

assert.ok(
  readBytes('dist/granola.png').equals(readBytes('dist/openclaw-logo-text-dark.png')),
  'dist/granola.png must remain the root compatibility alias for the canonical logo',
);

const builtAvatarDir = repoPath('dist/avatars/x');
assert.ok(statSync(builtAvatarDir).isDirectory(), 'dist/avatars/x must remain a directory');
assertFileExists('dist/avatars/x/steipete.jpg');
assertFileExists('dist/avatars/x/wilcosx.jpg');
assert.ok(
  readdirSync(builtAvatarDir).filter((file) => file.endsWith('.jpg')).length > 200,
  'dist/avatars/x must keep the cached X avatar set',
);

const homePage = readText('dist/index.html');
const integrationsPage = readText('dist/integrations/index.html');
const ecosystemPage = readText('dist/ecosystem/index.html');

for (const relativePath of listHtmlFiles('dist')) {
  assertJsonLdIsParseable(readText(relativePath), relativePath);
}

assertContains(homePage, siX.path, 'dist/index.html');
assertContains(homePage, siGooglechrome.path, 'dist/index.html');
assertContains(homePage, siGmail.path, 'dist/index.html');
assertContains(integrationsPage, siGoogle.path, 'dist/integrations/index.html');
assertContains(integrationsPage, siX.path, 'dist/integrations/index.html');

const ecosystemAssetPaths = new Set(
  [...ecosystemPage.matchAll(/(?:src|href)="(\/ecosystem\/[^"#?]+)"/g)].map(
    ([, assetPath]) => assetPath,
  ),
);
for (const assetPath of ecosystemAssetPaths) {
  assertFileExists(`dist${assetPath}`);
}

console.log('built asset compatibility checks passed');
