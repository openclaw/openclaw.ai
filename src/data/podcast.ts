export type PodcastPerson = {
  name: string;
  xUrl?: string;
};

export type PodcastDescriptionLink = {
  text: string;
  href: string;
};

export type PodcastEpisode = {
  number: number;
  slug: string;
  title: string;
  hosts: PodcastPerson[];
  guests: PodcastPerson[];
  airedAt: string;
  youtubeUrl: string;
  spotifyUrl: string;
  spotifyLabel: string;
  description: string;
  listingSummary?: string;
  descriptionLinks?: PodcastDescriptionLink[];
  shareImage?: string;
};

const spotifyShowUrl = 'https://open.spotify.com/show/033M5Wn9WAAdujY1qAcIYO';

export const podcastEpisodes: PodcastEpisode[] = [
  {
    number: 8,
    slug: 'episode-8',
    title: 'Live Demo: OpenClaw’s New Web UI, Multiplayer OpenClaw, and Mac Onboarding',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: 'Josh Lehman', xUrl: 'https://x.com/jlehman_' },
    ],
    airedAt: '2026-08-19',
    youtubeUrl: 'https://www.youtube.com/watch?v=8HWopYIwbN8',
    spotifyUrl: 'https://open.spotify.com/episode/26L06Vw1R0ceMMl7x7cEPT',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Josh Lehman joins Hannes Rudolph and Patrick Erichsen for live demos of the upcoming OpenClaw release, including the rebuilt web UI, Multiplayer OpenClaw, and a streamlined Mac onboarding experience.',
    description: `In this episode of OpenClaw’s official podcast, The ClawCast, host Hannes Rudolph, OpenClaw Community Manager, and co-host Patrick Erichsen, OpenClaw Developer, are joined by Josh Lehman, OpenClaw maintainer and founder of Martian Engineering, to live-demo major parts of the upcoming OpenClaw release: the rebuilt web UI, Multiplayer OpenClaw, and the new Mac onboarding experience.

The demos show the Control UI as a full browser-based software development environment, a shared RoboClaw gateway where teammates can see, share, and take over agent sessions, and a streamlined macOS installer that discovers existing models, credentials, skills, and plugins. The conversation also covers why the release is taking longer, the push for stability, the self-learning Skill Workshop, and the rewritten memory system.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen
Josh Lehman: https://x.com/jlehman_

Listen on Spotify: https://open.spotify.com/episode/26L06Vw1R0ceMMl7x7cEPT

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 7,
    slug: 'episode-7',
    title: 'Unfiltered Q&A with OpenClaw Founder Peter Steinberger',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: 'Peter Steinberger', xUrl: 'https://x.com/steipete' },
    ],
    airedAt: '2026-08-12',
    youtubeUrl: 'https://www.youtube.com/watch?v=WhkfUnKJuoY',
    spotifyUrl: 'https://open.spotify.com/episode/5mA2L9xmW76nq4erEKb3MP',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Peter Steinberger, founder of OpenClaw, joins Hannes Rudolph and Patrick Erichsen for an unfiltered community Q&A about where OpenClaw is headed, the upcoming release, and how agents are changing software development.',
    description: `An unfiltered Q&A with Peter Steinberger, founder of OpenClaw. Host Hannes Rudolph and co-host Patrick Erichsen put community questions to Peter about where OpenClaw is headed, the upcoming release, and how agents are changing the way software gets built.

Together, they cover cloud-backed multiplayer workflows, using OpenClaw to build OpenClaw, SQLite, team servers, agent-to-agent collaboration, memory, model routing, onboarding, browser control, hardware experiments, and why open source remains OpenClaw’s core differentiator.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen
Peter Steinberger: https://x.com/steipete

Listen on Spotify: https://open.spotify.com/episode/5mA2L9xmW76nq4erEKb3MP

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 6,
    slug: 'episode-6',
    title: 'Episode 6',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [],
    airedAt: '2026-07-30',
    youtubeUrl: 'https://www.youtube.com/watch?v=WKfeP5zw0CY',
    spotifyUrl: 'https://open.spotify.com/episode/3OyE8Is3VPBOI41rvnpDJp',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Hannes Rudolph and Patrick Erichsen answer community questions about how they use OpenClaw day to day, why release stability is a priority, and what is coming next for the Control UI, mobile apps, ClawHub, and agent workflows.',
    description: `In this episode of OpenClaw’s official podcast, The ClawCast, host Hannes Rudolph, OpenClaw Community Manager, and co-host Patrick Erichsen, OpenClaw Developer, answer community questions about how they use OpenClaw day to day, why the team is prioritizing release stability, and what is coming next for the Control UI, mobile apps, ClawHub, and agent workflows.

The conversation covers configuration cleanup, reusable agent setups, Claw Scan and credential security, open-weight models, unified crons, and real-time voice.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen

Listen on Spotify: https://open.spotify.com/episode/3OyE8Is3VPBOI41rvnpDJp

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 5,
    slug: 'episode-5',
    title: 'Episode 5',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: 'Kevin Lin', xUrl: 'https://x.com/kevins8' },
    ],
    airedAt: '2026-07-22',
    youtubeUrl: 'https://www.youtube.com/watch?v=zSkI2vJlmbs',
    spotifyUrl: spotifyShowUrl,
    spotifyLabel: 'Open Spotify show',
    listingSummary: 'Kevin Lin from OpenAI joins Hannes Rudolph and Patrick Erichsen to discuss OpenClaw 7.2, the new Control UI, and what it takes to pair effectively with an agent.',
    description: `In this episode of OpenClaw’s official podcast, The ClawCast, host Hannes Rudolph, OpenClaw Community Manager, and co-host Patrick Erichsen, OpenClaw Developer, are joined by Kevin Lin from OpenAI to discuss the upcoming OpenClaw 7.2 release, the new Control UI built for daily-driving agents, and what it really takes to pair with an agent instead of just handing off a task.

The conversation covers using OpenClaw as an orchestrator that delegates coding to Codex, why human taste and judgment still matter for keeping code maintainable, where today’s frontier models still fall short, the revamped agentic onboarding (auto-detecting API keys and spinning up a local model so you can get from zero to one), the refactor from JSONL files to SQLite, and the new monthly “stable release” aimed at enterprises that want longer lead times between upgrades.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen
Kevin Lin: https://x.com/kevins8`,
  },
  {
    number: 4,
    slug: 'episode-4',
    title: 'Episode 4',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: 'Sam Odio', xUrl: 'https://x.com/sodio' },
    ],
    airedAt: '2026-07-15',
    youtubeUrl: 'https://www.youtube.com/watch?v=zEiqIovjULc',
    spotifyUrl: 'https://open.spotify.com/episode/5EQQ2N2n1yYtRx9X2Q3JEf',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Sam Odio, host of AI Worth Using, joins Hannes Rudolph and Patrick Erichsen to discuss making OpenClaw more accessible without sacrificing its flexibility and extensibility.',
    descriptionLinks: [
      { text: 'AI Worth Using', href: 'https://aiworthusing.com' },
    ],
    description: `In this episode of OpenClaw’s official podcast, The ClawCast, host Hannes Rudolph, OpenClaw Community Manager, and co-host Patrick Erichsen, OpenClaw Developer, are joined by Sam Odio, host of AI Worth Using, to discuss how OpenClaw can remain powerful for hackers, become more accessible to AI tinkerers, and ultimately grow into something anyone can use without sacrificing its flexibility and extensibility.

The conversation also explores agent security, lowering the technical barrier to experimentation, and what OpenClaw can learn from delegation and systems engineering as agentic workflows become more capable.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen
Sam Odio: https://x.com/sodio
AI Worth Using: https://x.com/aiworthusing

Listen on Spotify: https://open.spotify.com/episode/5EQQ2N2n1yYtRx9X2Q3JEf

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 3,
    slug: 'episode-3',
    title: 'Episode 3',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
    ],
    guests: [
      { name: 'Josh Lehman', xUrl: 'https://x.com/jlehman_' },
      { name: 'Sedrak Hovhannisyan', xUrl: 'https://x.com/Sedrak1010' },
      { name: 'Alexander Adamyan', xUrl: 'https://x.com/sashforce' },
    ],
    airedAt: '2026-07-08',
    youtubeUrl: 'https://www.youtube.com/watch?v=TQ7SgFXvieY',
    spotifyUrl: 'https://open.spotify.com/episode/2DQqQHQCZsl2sbGTKsLzq7',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Josh Lehman, Sedrak Hovhannisyan, and Alexander Adamyan join Hannes Rudolph to discuss OpenClaw onboarding, agent self-improvement, and long-running autonomous workflows.',
    description: `In this episode of OpenClaw’s official podcast, The Clawcast, host Hannes Rudolph, OpenClaw Community Manager, is joined by Josh Lehman, OpenClaw maintainer and founder of Martian Engineering, and Sedrak Hovhannisyan and Alexander Adamyan, co-founders of Vana Labs, to discuss the OpenClaw onboarding overhaul, why the planned onboarding demo was cancelled, what OpenClaw can learn from Hermes’s self-improvement system, and how OpenClaw compares to tools like Codex for long-running autonomous workflows.

The conversation covers the push to make OpenClaw easier for non-technical users, the role of skills and self-improvement in agent workflows, the difference between managed AI tools and user-owned open-source systems, and why OpenClaw's flexibility makes it uniquely powerful for automation.

Learn more about The OpenClaw Foundation: https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Josh Lehman: https://x.com/jlehman_
Sedrak Hovhannisyan: https://x.com/Sedrak1010
Alexander Adamyan: https://x.com/sashforce

Listen on Spotify: https://open.spotify.com/episode/2DQqQHQCZsl2sbGTKsLzq7

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 2,
    slug: 'episode-2',
    title: 'Episode 2',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: "Sally Ann O'Malley", xUrl: 'https://x.com/somalley108' },
      { name: 'Peter Steinberger', xUrl: 'https://x.com/steipete' },
    ],
    airedAt: '2026-07-01',
    youtubeUrl: 'https://www.youtube.com/watch?v=VJMhxh7KpqQ',
    spotifyUrl: 'https://open.spotify.com/episode/5GwMaO6y852bjiVTAimOYT',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Sally Ann O’Malley and Peter Steinberger join Hannes Rudolph and Patrick Erichsen to discuss OpenClaw stability, security, mobile apps, and the project’s future.',
    description: `In this episode of OpenClaw’s official podcast, The Clawcast, host Hannes Rudolph, OpenClaw Community Manager, and co-host Patrick Erichsen, OpenClaw Developer, are joined by Sally Ann O’Malley from Red Hat, a maintainer of the OpenClaw OSS repo, and Peter Steinberger, founder of OpenClaw, to discuss OpenClaw stability, security, the future of OpenClaw, and the community’s response to our recently released OpenClaw mobile app.

Learn more about The OpenClaw Foundation:
https://www.openclaw.org

Guests and hosts socials:
Hannes Rudolph: https://x.com/hrudolph
Patrick Erichsen: https://x.com/Pat_Erichsen
Sally Ann O'Malley: https://x.com/somalley108
Peter Steinberger: https://x.com/steipete

Listen on Spotify: https://open.spotify.com/episode/5GwMaO6y852bjiVTAimOYT

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
  {
    number: 1,
    slug: 'episode-1',
    title: 'Episode 1',
    hosts: [
      { name: 'Hannes Rudolph', xUrl: 'https://x.com/hrudolph' },
      { name: 'Patrick Erichsen', xUrl: 'https://x.com/Pat_Erichsen' },
    ],
    guests: [
      { name: 'Adam from GosuCoder' },
    ],
    airedAt: '2026-06-24',
    youtubeUrl: 'https://www.youtube.com/watch?v=IfJJnR1LIE0',
    spotifyUrl: 'https://open.spotify.com/episode/199ux52AK8oXunvP7siG8Z',
    spotifyLabel: 'Open in Spotify',
    listingSummary: 'Adam from GosuCoder joins Hannes Rudolph and Patrick Erichsen to discuss OpenClaw and the latest developments in AI.',
    description: `In this inaugural episode of the official OpenClaw podcast, The ClawCast, host Hannes Rudolph (OpenClaw Community Manager) and co-host Patrick Erichsen (OpenClaw Developer) are joined by Adam from the YouTube channel GosuCoder to discuss all things OpenClaw and the latest happenings in AI.

Guest:
Adam from @GosuCoder

Listen on Spotify: https://open.spotify.com/episode/199ux52AK8oXunvP7siG8Z

Recorded live every Wednesday at 11:30 AM PT on Discord.
Join our Discord: https://discord.com/invite/clawd`,
  },
];

export function getEpisodeSummary(episode: PodcastEpisode): string {
  return episode.description.split('\n\n')[0];
}

export function getEpisodeListingSummary(episode: PodcastEpisode): string {
  return episode.listingSummary ?? getEpisodeSummary(episode);
}

export function formatPodcastPeople(people: PodcastPerson[]): string {
  return new Intl.ListFormat('en-US', {
    style: 'long',
    type: 'conjunction',
  }).format(people.map((person) => person.name));
}

export function formatEpisodeDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export function formatEpisodeListDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00Z`));
}
