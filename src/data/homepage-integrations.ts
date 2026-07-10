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
  WhatsApp: { name: 'WhatsApp', kind: 'Channel', icon: iconPath(siWhatsapp), color: '#25D366', description: 'Personal chats, group loops, approvals.' },
  Telegram: { name: 'Telegram', kind: 'Channel', icon: iconPath(siTelegram), color: '#26A5E4', description: 'Bots, topics, rich media, updates.' },
  Discord: { name: 'Discord', kind: 'Channel', icon: iconPath(siDiscord), color: '#5865F2', description: 'Servers, DMs, shared agent rooms.' },
  Slack: { name: 'Slack', kind: 'Channel', icon: 'lucide:hash', color: '#E01E5A', description: 'Team channels and approval prompts.' },
  Signal: { name: 'Signal', kind: 'Channel', icon: iconPath(siSignal), color: '#3A76F0', description: 'Private conversations with local control.' },
  iMessage: { name: 'iMessage', kind: 'Channel', icon: iconPath(siApple), color: '#007AFF', description: 'Apple-native threads from your Mac.' },
  Claude: { name: 'Claude', kind: 'Model', icon: iconPath(siAnthropic), color: '#D4A574', description: 'Bring frontier models into one session.' },
  GPT: { name: 'GPT', kind: 'Model', icon: 'lucide:bot', color: '#00A67E', description: 'Reasoning, coding, and tool use together.' },
  Spotify: { name: 'Spotify', kind: 'Tool', icon: iconPath(siSpotify), color: '#1DB954', description: 'Skills can reach daily apps.' },
  Hue: { name: 'Hue', kind: 'Home', icon: iconPath(siPhilipshue), color: '#0065D3', description: 'Smart-home actions from chat.' },
  Obsidian: { name: 'Obsidian', kind: 'Notes', icon: iconPath(siObsidian), color: '#7C3AED', description: 'Vaults, memory, and personal context.' },
  Twitter: { name: 'Twitter', kind: 'Web', icon: iconPath(siX), color: 'var(--oc-text-primary)', description: 'Research, drafts, bookmarks, posts.' },
  Browser: { name: 'Browser', kind: 'Web', icon: iconPath(siGooglechrome), color: '#4285F4', description: 'Forms, pages, extraction, inspection.' },
  Gmail: { name: 'Gmail', kind: 'Inbox', icon: iconPath(siGmail), color: '#EA4335', description: 'Summaries, follow-ups, triage.' },
  GitHub: { name: 'GitHub', kind: 'Code', icon: iconPath(siGithub), color: 'var(--oc-text-primary)', description: 'Issues, PRs, reviews, releases.' },
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
