import {
  siAndroid,
  siAnthropic,
  siApple,
  siDiscord,
  siGoogle,
  siIos,
  siLine,
  siLinux,
  siMatrix,
  siMattermost,
  siMinimax,
  siMoonshotai,
  siNextcloud,
  siQq,
  siQwen,
  siSignal,
  siTelegram,
  siTwitch,
  siWhatsapp,
  siWechat,
  siX,
  siZalo,
} from 'simple-icons';

const siIcon = (icon: { path: string }) => icon.path;
const openAiIcon = 'M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z';
const zAiIcon = 'M12.105 2L9.927 4.953H.653L2.83 2h9.276zM23.254 19.048L21.078 22h-9.242l2.174-2.952h9.244zM24 2L9.264 22H0L14.736 2H24z';

export type CatalogItem = {
  name: string;
  desc: string;
  docs: string;
  icon: string;
  logo?: string;
  color: string;
};

export type LinkItem = {
  name: string;
  docs: string;
};

export type CatalogGroup = {
  name: string;
  desc: string;
  icon: string;
  color: string;
  links: LinkItem[];
};

export const catalogSnapshot = {
  stats: [
    { value: '28', label: 'chat channels' },
    { value: '64', label: 'model & media providers' },
    { value: '142', label: 'official plugins' },
  ],
};

const channelCatalog: CatalogItem[] = [
  { name: 'Discord', desc: 'Servers, channels, DMs, commands, and app events.', docs: 'https://docs.openclaw.ai/channels/discord', icon: siIcon(siDiscord), color: '#5865F2' },
  { name: 'Feishu / Lark', desc: 'Workplace chats and tools over WebSocket.', docs: 'https://docs.openclaw.ai/channels/feishu', icon: 'lucide:message-circle', logo: '/integrations/logos/lark.svg', color: '#3370FF' },
  { name: 'Google Chat', desc: 'Spaces and direct messages through a Chat app.', docs: 'https://docs.openclaw.ai/channels/googlechat', icon: siIcon(siGoogle), color: '#34A853' },
  { name: 'iMessage', desc: 'Native macOS messaging through the imsg bridge.', docs: 'https://docs.openclaw.ai/channels/imessage', icon: siIcon(siApple), color: '#007AFF' },
  { name: 'IRC', desc: 'Classic IRC channels and DMs with access controls.', docs: 'https://docs.openclaw.ai/channels/irc', icon: 'lucide:hash', color: '#F59E0B' },
  { name: 'LINE', desc: 'LINE Messaging API bot conversations.', docs: 'https://docs.openclaw.ai/channels/line', icon: siIcon(siLine), color: '#06C755' },
  { name: 'Matrix', desc: 'Rooms and direct messages over Matrix.', docs: 'https://docs.openclaw.ai/channels/matrix', icon: siIcon(siMatrix), color: 'currentColor' },
  { name: 'Mattermost', desc: 'Channels, groups, and DMs over Bot API and WebSocket.', docs: 'https://docs.openclaw.ai/channels/mattermost', icon: siIcon(siMattermost), color: '#0058CC' },
  { name: 'Microsoft Teams', desc: 'Enterprise conversations through Bot Framework.', docs: 'https://docs.openclaw.ai/channels/msteams', icon: 'lucide:users', logo: '/integrations/logos/microsoft-teams.svg', color: '#6264A7' },
  { name: 'Nextcloud Talk', desc: 'Self-hosted chat through Nextcloud Talk.', docs: 'https://docs.openclaw.ai/channels/nextcloud-talk', icon: siIcon(siNextcloud), color: '#0082C9' },
  { name: 'Nostr', desc: 'Decentralized encrypted direct messages.', docs: 'https://docs.openclaw.ai/channels/nostr', icon: 'lucide:message-circle', logo: '/integrations/logos/nostr.svg', color: '#8F2CFF' },
  { name: 'QQ Bot', desc: 'Private chats, group chats, and rich media.', docs: 'https://docs.openclaw.ai/channels/qqbot', icon: siIcon(siQq), color: '#1EBAFC' },
  { name: 'Raft', desc: 'Raft CLI wake bridge for human and agent collaboration.', docs: 'https://docs.openclaw.ai/channels/raft', icon: 'lucide:sailboat', color: '#38BDF8' },
  { name: 'Signal', desc: 'Privacy-focused messaging through signal-cli.', docs: 'https://docs.openclaw.ai/channels/signal', icon: siIcon(siSignal), color: '#3A76F0' },
  { name: 'Slack', desc: 'Channels, DMs, commands, and app events.', docs: 'https://docs.openclaw.ai/channels/slack', icon: 'lucide:hash', logo: '/integrations/logos/slack.svg', color: '#E01E5A' },
  { name: 'SMS', desc: 'Twilio-backed text messaging through the Gateway.', docs: 'https://docs.openclaw.ai/channels/sms', icon: 'lucide:message-circle', logo: '/integrations/logos/twilio.svg', color: '#F12E45' },
  { name: 'Synology Chat', desc: 'Synology NAS chat through incoming and outgoing webhooks.', docs: 'https://docs.openclaw.ai/channels/synology-chat', icon: 'lucide:server-cog', logo: '/integrations/logos/synology.svg', color: '#B6D957' },
  { name: 'Telegram', desc: 'Bot API conversations, groups, and rich media.', docs: 'https://docs.openclaw.ai/channels/telegram', icon: siIcon(siTelegram), color: '#26A5E4' },
  { name: 'Tlon', desc: 'Urbit-based messaging for chat workflows.', docs: 'https://docs.openclaw.ai/channels/tlon', icon: 'lucide:network', logo: '/integrations/logos/urbit.svg', color: '#F0F4FF' },
  { name: 'Twitch', desc: 'Live chat and moderation workflows.', docs: 'https://docs.openclaw.ai/channels/twitch', icon: siIcon(siTwitch), color: '#9146FF' },
  { name: 'Voice Call', desc: 'Phone conversations through Twilio, Telnyx, or Plivo.', docs: 'https://docs.openclaw.ai/plugins/voice-call', icon: 'lucide:mic', color: '#F97316' },
  { name: 'WebChat', desc: 'Gateway-hosted browser chat over WebSocket.', docs: 'https://docs.openclaw.ai/web/webchat', icon: 'lucide:globe', color: '#00E5CC' },
  { name: 'WeChat / Weixin', desc: 'Tencent iLink messaging through QR login.', docs: 'https://docs.openclaw.ai/channels/wechat', icon: siIcon(siWechat), color: '#07C160' },
  { name: 'WhatsApp', desc: 'WhatsApp Web chats through QR pairing.', docs: 'https://docs.openclaw.ai/channels/whatsapp', icon: siIcon(siWhatsapp), color: '#25D366' },
  { name: 'Yuanbao', desc: 'Tencent Yuanbao bot conversations.', docs: 'https://docs.openclaw.ai/channels/yuanbao', icon: 'lucide:bot', logo: '/integrations/logos/yuanbao.svg', color: '#00CC70' },
  { name: 'Zalo', desc: 'Zalo Bot API chats and webhooks.', docs: 'https://docs.openclaw.ai/channels/zalo', icon: siIcon(siZalo), color: '#0068FF' },
  { name: 'Zalo ClawBot', desc: 'Owner-bound personal Zalo assistant through QR login.', docs: 'https://docs.openclaw.ai/channels/zaloclawbot', icon: siIcon(siZalo), color: '#00A8FF' },
  { name: 'Zalo Personal', desc: 'Personal-account messaging through native zca-js.', docs: 'https://docs.openclaw.ai/channels/zalouser', icon: siIcon(siZalo), color: '#0068FF' },
];

export const channels = [...channelCatalog].sort((left, right) =>
  left.name.localeCompare(right.name)
);

const featuredProviderCatalog: CatalogItem[] = [
  { name: 'Anthropic', desc: 'Claude API and Claude CLI with API-key and subscription-backed routes.', docs: 'https://docs.openclaw.ai/providers/anthropic', icon: siIcon(siAnthropic), color: '#D4A574' },
  { name: 'OpenAI', desc: 'OpenAI API plus ChatGPT/Codex sign-in and native Codex execution.', docs: 'https://docs.openclaw.ai/providers/openai', icon: openAiIcon, color: '#00A67E' },
  { name: 'Google', desc: 'Gemini API and CLI OAuth across chat, search, media, and voice.', docs: 'https://docs.openclaw.ai/providers/google', icon: siIcon(siGoogle), color: '#4285F4' },
  { name: 'xAI', desc: 'Grok OAuth and API routes with search, code, image, video, and speech.', docs: 'https://docs.openclaw.ai/providers/xai', icon: siIcon(siX), color: 'currentColor' },
  { name: 'MiniMax', desc: 'Coding Plan OAuth and API-key routes across chat and generated media.', docs: 'https://docs.openclaw.ai/providers/minimax', icon: siIcon(siMinimax), color: '#F0568A' },
  { name: 'Z.AI', desc: 'GLM models through Coding Plan and general API routes.', docs: 'https://docs.openclaw.ai/providers/zai', icon: zAiIcon, color: '#00C8A0' },
  { name: 'Moonshot / Kimi', desc: 'Kimi general models and a separate coding-focused provider.', docs: 'https://docs.openclaw.ai/providers/moonshot', icon: siIcon(siMoonshotai), color: '#8B8CFF' },
  { name: 'Qwen', desc: 'Qwen Cloud, Coding Plan, and Portal token flows.', docs: 'https://docs.openclaw.ai/providers/qwen', icon: siIcon(siQwen), color: '#7357FF' },
];

export const featuredProviders = [...featuredProviderCatalog].sort((left, right) =>
  left.name.localeCompare(right.name)
);

export const providerGroups: CatalogGroup[] = [
  {
    name: 'Hosted models',
    desc: 'Direct model APIs and subscription-backed coding providers.',
    icon: 'lucide:brain',
    color: '#FF7A7A',
    links: [
      { name: 'Mistral', docs: 'https://docs.openclaw.ai/providers/mistral' },
      { name: 'DeepSeek', docs: 'https://docs.openclaw.ai/providers/deepseek' },
      { name: 'OpenCode', docs: 'https://docs.openclaw.ai/providers/opencode' },
      { name: 'GitHub Copilot', docs: 'https://docs.openclaw.ai/providers/github-copilot' },
      { name: 'Alibaba Model Studio', docs: 'https://docs.openclaw.ai/providers/alibaba' },
      { name: 'Xiaomi', docs: 'https://docs.openclaw.ai/providers/xiaomi' },
      { name: 'StepFun', docs: 'https://docs.openclaw.ai/providers/stepfun' },
      { name: 'Volcengine', docs: 'https://docs.openclaw.ai/providers/volcengine' },
      { name: 'Tencent Cloud', docs: 'https://docs.openclaw.ai/providers/tencent' },
      { name: 'Qianfan', docs: 'https://docs.openclaw.ai/providers/qianfan' },
      { name: 'Cohere', docs: 'https://docs.openclaw.ai/providers/cohere' },
      { name: 'Synthetic', docs: 'https://docs.openclaw.ai/providers/synthetic' },
      { name: 'Venice', docs: 'https://docs.openclaw.ai/providers/venice' },
      { name: 'Arcee AI', docs: 'https://docs.openclaw.ai/providers/arcee' },
      { name: 'Vydra', docs: 'https://docs.openclaw.ai/providers/vydra' },
      { name: 'GMI Cloud', docs: 'https://docs.openclaw.ai/providers/gmi' },
    ],
  },
  {
    name: 'Inference and gateways',
    desc: 'Route models through enterprise clouds, unified gateways, and hosted inference.',
    icon: 'lucide:cloud',
    color: '#65D6C5',
    links: [
      { name: 'Amazon Bedrock', docs: 'https://docs.openclaw.ai/providers/bedrock' },
      { name: 'Bedrock Mantle', docs: 'https://docs.openclaw.ai/providers/bedrock-mantle' },
      { name: 'Anthropic Vertex', docs: 'https://docs.openclaw.ai/providers/models#additional-provider-variants' },
      { name: 'Cloudflare AI Gateway', docs: 'https://docs.openclaw.ai/providers/cloudflare-ai-gateway' },
      { name: 'Vercel AI Gateway', docs: 'https://docs.openclaw.ai/providers/vercel-ai-gateway' },
      { name: 'OpenRouter', docs: 'https://docs.openclaw.ai/providers/openrouter' },
      { name: 'LiteLLM', docs: 'https://docs.openclaw.ai/providers/litellm' },
      { name: 'Microsoft Foundry', docs: 'https://docs.openclaw.ai/concepts/model-providers' },
      { name: 'Groq', docs: 'https://docs.openclaw.ai/providers/groq' },
      { name: 'Cerebras', docs: 'https://docs.openclaw.ai/providers/cerebras' },
      { name: 'Together AI', docs: 'https://docs.openclaw.ai/providers/together' },
      { name: 'Fireworks', docs: 'https://docs.openclaw.ai/providers/fireworks' },
      { name: 'NVIDIA', docs: 'https://docs.openclaw.ai/providers/nvidia' },
      { name: 'Hugging Face', docs: 'https://docs.openclaw.ai/providers/huggingface' },
      { name: 'DeepInfra', docs: 'https://docs.openclaw.ai/providers/deepinfra' },
      { name: 'Chutes', docs: 'https://docs.openclaw.ai/providers/chutes' },
      { name: 'NovitaAI', docs: 'https://docs.openclaw.ai/providers/novita' },
      { name: 'Kilocode', docs: 'https://docs.openclaw.ai/providers/kilocode' },
      { name: 'BytePlus', docs: 'https://docs.openclaw.ai/concepts/model-providers#byteplus-(international)' },
      { name: 'Ollama Cloud', docs: 'https://docs.openclaw.ai/providers/ollama-cloud' },
    ],
  },
  {
    name: 'Local and self-hosted',
    desc: 'Run models on your own hardware or point OpenClaw at a compatible endpoint.',
    icon: 'lucide:server-cog',
    color: '#F6C65B',
    links: [
      { name: 'Ollama', docs: 'https://docs.openclaw.ai/providers/ollama' },
      { name: 'LM Studio', docs: 'https://docs.openclaw.ai/providers/lmstudio' },
      { name: 'vLLM', docs: 'https://docs.openclaw.ai/providers/vllm' },
      { name: 'SGLang', docs: 'https://docs.openclaw.ai/providers/sglang' },
      { name: 'inferrs', docs: 'https://docs.openclaw.ai/providers/inferrs' },
      { name: 'ds4', docs: 'https://docs.openclaw.ai/providers/ds4' },
      { name: 'Custom compatible APIs', docs: 'https://docs.openclaw.ai/concepts/model-providers#providers-via-models.providers-(custom%2Fbase-url)' },
    ],
  },
  {
    name: 'Media, speech, and search',
    desc: 'Generate and understand images, video, music, speech, and live web results.',
    icon: 'lucide:image',
    color: '#B38CFF',
    links: [
      { name: 'OpenAI media', docs: 'https://docs.openclaw.ai/providers/openai' },
      { name: 'Google media', docs: 'https://docs.openclaw.ai/providers/google' },
      { name: 'xAI media', docs: 'https://docs.openclaw.ai/providers/xai' },
      { name: 'MiniMax media', docs: 'https://docs.openclaw.ai/providers/minimax' },
      { name: 'fal', docs: 'https://docs.openclaw.ai/providers/fal' },
      { name: 'ComfyUI', docs: 'https://docs.openclaw.ai/providers/comfy' },
      { name: 'Runway', docs: 'https://docs.openclaw.ai/providers/runway' },
      { name: 'PixVerse', docs: 'https://docs.openclaw.ai/providers/pixverse' },
      { name: 'Deepgram', docs: 'https://docs.openclaw.ai/providers/deepgram' },
      { name: 'ElevenLabs', docs: 'https://docs.openclaw.ai/providers/elevenlabs' },
      { name: 'Azure Speech', docs: 'https://docs.openclaw.ai/providers/azure-speech' },
      { name: 'SenseAudio', docs: 'https://docs.openclaw.ai/providers/senseaudio' },
      { name: 'Perplexity search', docs: 'https://docs.openclaw.ai/providers/perplexity-provider' },
    ],
  },
];

export const capabilities: CatalogItem[] = [
  { name: 'Web and browser', desc: 'Search, fetch readable pages, inspect X, and operate browser sessions.', docs: 'https://docs.openclaw.ai/tools/web', icon: 'lucide:globe', color: '#4FA8FF' },
  { name: 'Files and code', desc: 'Read, write, patch, run commands, and use provider-backed code execution.', docs: 'https://docs.openclaw.ai/tools', icon: 'lucide:terminal', color: '#F6C65B' },
  { name: 'Messaging actions', desc: 'Reply, react, route, and send through connected channels.', docs: 'https://docs.openclaw.ai/tools/agent-send', icon: 'lucide:message-circle', color: '#00E5CC' },
  { name: 'Agents and sessions', desc: 'Delegate, steer, coordinate ACP harnesses, and track goals.', docs: 'https://docs.openclaw.ai/tools/subagents', icon: 'lucide:network', color: '#A98BFF' },
  { name: 'Generated media', desc: 'Create images, videos, music, and spoken replies with provider failover.', docs: 'https://docs.openclaw.ai/tools/media-overview', icon: 'lucide:image', color: '#FF72A6' },
  { name: 'Tool Search', desc: 'Discover and call large eligible tool catalogs without loading every schema.', docs: 'https://docs.openclaw.ai/tools/tool-search', icon: 'lucide:search', color: '#F97316' },
  { name: 'Automation', desc: 'Schedule, monitor, trigger, and audit work in the background.', docs: 'https://docs.openclaw.ai/automation', icon: 'lucide:clock', color: '#65D6C5' },
  { name: 'Plugins and skills', desc: 'Add channels, providers, tools, hooks, workflows, and reusable instructions.', docs: 'https://docs.openclaw.ai/tools/plugin', icon: 'lucide:plug', color: '#FF7A7A' },
];

export const automationLinks: LinkItem[] = [
  { name: 'Scheduled Tasks', docs: 'https://docs.openclaw.ai/automation/cron-jobs' },
  { name: 'Heartbeat', docs: 'https://docs.openclaw.ai/gateway/heartbeat' },
  { name: 'Background Tasks', docs: 'https://docs.openclaw.ai/automation/tasks' },
  { name: 'Task Flow', docs: 'https://docs.openclaw.ai/automation/taskflow' },
  { name: 'Commitments', docs: 'https://docs.openclaw.ai/concepts/commitments' },
  { name: 'Hooks', docs: 'https://docs.openclaw.ai/automation/hooks' },
  { name: 'Standing Orders', docs: 'https://docs.openclaw.ai/automation/standing-orders' },
  { name: 'Webhooks', docs: 'https://docs.openclaw.ai/automation/webhook' },
];

export const gatewayHosts: CatalogItem[] = [
  { name: 'macOS', desc: 'Run the Gateway locally or connect the menu-bar companion to a remote Gateway.', docs: 'https://docs.openclaw.ai/platforms/macos', icon: siIcon(siApple), color: 'currentColor' },
  { name: 'Windows', desc: 'Use Windows Hub, native PowerShell, or a WSL2-hosted Gateway.', docs: 'https://docs.openclaw.ai/platforms/windows', icon: 'lucide:monitor', logo: '/integrations/logos/windows.svg', color: '#3B82F6' },
  { name: 'Linux', desc: 'Fully supported Gateway host with systemd service management.', docs: 'https://docs.openclaw.ai/platforms/linux', icon: siIcon(siLinux), color: '#FCC624' },
  { name: 'VPS and cloud', desc: 'Deploy on Fly.io, Hetzner, GCP, Azure, exe.dev, EasyRunner, and more.', docs: 'https://docs.openclaw.ai/platforms', icon: 'lucide:cloud', color: '#65D6C5' },
];

export const companionNodes: CatalogItem[] = [
  { name: 'macOS app', desc: 'Menu bar, notifications, Canvas, camera, screen, and system tools.', docs: 'https://docs.openclaw.ai/platforms/macos', icon: siIcon(siApple), color: 'currentColor' },
  { name: 'Windows Hub', desc: 'Setup, tray status, chat, node mode, camera, screen, and speech.', docs: 'https://docs.openclaw.ai/platforms/windows', icon: 'lucide:monitor', logo: '/integrations/logos/windows.svg', color: '#3B82F6' },
  { name: 'iOS node', desc: 'Canvas, screen snapshot, camera, location, Talk mode, and Voice Wake.', docs: 'https://docs.openclaw.ai/platforms/ios', icon: siIcon(siIos), color: '#007AFF' },
  { name: 'Android node', desc: 'Official companion node for chat, voice, Canvas, screen, and camera.', docs: 'https://docs.openclaw.ai/platforms/android', icon: siIcon(siAndroid), color: '#34A853' },
];

export const communityGroups: CatalogGroup[] = [
  {
    name: 'Work and knowledge',
    desc: 'Connect the tools where your notes, projects, and code already live.',
    icon: 'lucide:book-open',
    color: '#B38CFF',
    links: [
      { name: 'Apple Notes', docs: 'https://clawhub.ai/steipete/apple-notes' },
      { name: 'Notion', docs: 'https://clawhub.ai/steipete/notion' },
      { name: 'Obsidian', docs: 'https://clawhub.ai/steipete/obsidian' },
      { name: 'GitHub', docs: 'https://clawhub.ai/steipete/github' },
    ],
  },
  {
    name: 'Home and audio',
    desc: 'Let agents control rooms, playback, lighting, and home automation.',
    icon: 'lucide:home',
    color: '#65D6C5',
    links: [
      { name: 'Home Assistant', docs: 'https://clawhub.ai/skills?q=home+assistant' },
      { name: 'Philips Hue', docs: 'https://clawhub.ai/steipete/openhue' },
      { name: 'Spotify', docs: 'https://clawhub.ai/steipete/spotify-player' },
      { name: 'Sonos', docs: 'https://clawhub.ai/steipete/sonoscli' },
    ],
  },
  {
    name: 'Communication and services',
    desc: 'Extend OpenClaw with community-maintained service workflows.',
    icon: 'lucide:mail',
    color: '#FF7A7A',
    links: [
      { name: 'Email', docs: 'https://clawhub.ai/lamelas/himalaya' },
      { name: 'X / Twitter', docs: 'https://clawhub.ai/skills?q=twitter' },
      { name: '1Password', docs: 'https://clawhub.ai/steipete/1password' },
      { name: 'Weather', docs: 'https://clawhub.ai/steipete/weather' },
    ],
  },
];
