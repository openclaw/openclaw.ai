import type { SimpleIcon } from 'simple-icons';
import {
  siAnthropic,
  siApple,
  siDiscord,
  siGithub,
  siGmail,
  siGooglechrome,
  siObsidian,
  siPhilipshue,
  siSignal,
  siSpotify,
  siTelegram,
  siWhatsapp,
  siX,
} from 'simple-icons';

export type HomepageIntegration = {
  name: string;
  kind: string;
  icon: string;
  color: string;
  description: string;
};

const iconPath = (icon: SimpleIcon) => icon.path;

const integrations = {
  WhatsApp: { name: 'WhatsApp', kind: 'Channel', icon: iconPath(siWhatsapp), color: '#25D366', description: 'Your agent inside WhatsApp.' },
  Telegram: { name: 'Telegram', kind: 'Channel', icon: iconPath(siTelegram), color: '#26A5E4', description: 'Your agent in chats and groups.' },
  Discord: { name: 'Discord', kind: 'Channel', icon: iconPath(siDiscord), color: '#5865F2', description: 'Your agent in servers and DMs.' },
  Slack: { name: 'Slack', kind: 'Channel', icon: 'lucide:hash', color: '#E01E5A', description: 'Your agent where your team works.' },
  Signal: { name: 'Signal', kind: 'Channel', icon: iconPath(siSignal), color: '#3A76F0', description: 'Private chats with your agent.' },
  iMessage: { name: 'iMessage', kind: 'Channel', icon: iconPath(siApple), color: '#007AFF', description: 'Your agent inside Messages.' },
  Claude: { name: 'Claude', kind: 'Model', icon: iconPath(siAnthropic), color: '#D4A574', description: 'Claude, connected to your tools.' },
  GPT: { name: 'GPT', kind: 'Model', icon: 'lucide:bot', color: '#00A67E', description: 'GPT, connected to your tools.' },
  Spotify: { name: 'Spotify', kind: 'Tool', icon: iconPath(siSpotify), color: '#1DB954', description: 'Control your music from chat.' },
  Hue: { name: 'Hue', kind: 'Home', icon: iconPath(siPhilipshue), color: '#0065D3', description: 'Control your lights from chat.' },
  Obsidian: { name: 'Obsidian', kind: 'Notes', icon: iconPath(siObsidian), color: '#7C3AED', description: 'Put your vault to work.' },
  Twitter: { name: 'Twitter', kind: 'Web', icon: iconPath(siX), color: 'var(--oc-text-primary)', description: 'Research, draft, and publish.' },
  Browser: { name: 'Browser', kind: 'Web', icon: iconPath(siGooglechrome), color: '#4285F4', description: 'Browse, click, and get things done.' },
  Gmail: { name: 'Gmail', kind: 'Inbox', icon: iconPath(siGmail), color: '#EA4335', description: 'Read, draft, and manage email.' },
  GitHub: { name: 'GitHub', kind: 'Code', icon: iconPath(siGithub), color: 'var(--oc-text-primary)', description: 'Work across issues and pull requests.' },
} as const satisfies Record<string, HomepageIntegration>;

type IntegrationName = keyof typeof integrations;

const rail = (names: readonly IntegrationName[]): HomepageIntegration[] =>
  names.map((name) => integrations[name]);

export const topIntegrationRail = rail([
  'WhatsApp',
  'Telegram',
  'Discord',
  'Slack',
  'iMessage',
  'Claude',
  'GPT',
  'Signal',
]);

export const bottomIntegrationRail = rail([
  'Browser',
  'Gmail',
  'GitHub',
  'Obsidian',
  'Twitter',
  'Spotify',
  'Hue',
]);

export const integrationScrubberTickCount = 72;
