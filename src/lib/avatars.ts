import fs from 'node:fs';
import path from 'node:path';

const avatarRoot = path.join(process.cwd(), 'public', 'avatars', 'x');

export function normalizeXHandle(handle: string): string {
  const normalized = handle.replace(/^@/, '').trim().toLowerCase();
  return /^[a-z0-9_]{1,15}$/.test(normalized) ? normalized : '';
}

export function getCachedXAvatarSrc(handle: string, fallbackName = handle, size = 96): string {
  const normalized = normalizeXHandle(handle);
  if (!normalized) return getInitialsAvatarSrc(fallbackName, size);

  const filename = `${normalized}.jpg`;
  return fs.existsSync(path.join(avatarRoot, filename))
    ? `/avatars/x/${encodeURIComponent(filename)}`
    : getInitialsAvatarSrc(fallbackName, size);
}

export function getInitialsAvatarSrc(name: string, size = 96): string {
  const params = new URLSearchParams({
    name,
    background: 'FF4D4D',
    color: 'fff',
    size: String(size),
  });

  return `https://ui-avatars.com/api/?${params}`;
}
