import { describe, expect, test } from 'bun:test';
import { podcastEpisodes } from '../src/data/podcast';

describe('podcast episode catalog', () => {
  test('keeps Episode 8 first with its approved destinations and participants', () => {
    const episode = podcastEpisodes[0];

    expect(episode).toMatchObject({
      number: 8,
      slug: 'episode-8',
      title: 'Live Demo: OpenClaw’s New Web UI, Multiplayer OpenClaw, and Mac Onboarding',
      airedAt: '2026-08-19',
      youtubeUrl: 'https://www.youtube.com/watch?v=8HWopYIwbN8',
      spotifyUrl: 'https://open.spotify.com/episode/26L06Vw1R0ceMMl7x7cEPT',
    });
    expect(episode.hosts.map(({ name }) => name)).toEqual([
      'Hannes Rudolph',
      'Patrick Erichsen',
    ]);
    expect(episode.guests.map(({ name }) => name)).toEqual(['Josh Lehman']);
    expect(episode.description).toContain('Josh Lehman, OpenClaw Developer');
    expect(episode.description).not.toContain('Martian Engineering');
    expect(episode.description).toContain('live-demo major parts of the upcoming OpenClaw release');
    expect(episode.description).toContain('a shared RoboClaw gateway');
  });

  test('uses Josh Lehman’s current OpenClaw role in Episode 3', () => {
    const episode = podcastEpisodes.find(({ number }) => number === 3);

    expect(episode?.description).toContain('Josh Lehman, OpenClaw Developer');
    expect(episode?.description).not.toContain('Martian Engineering');
  });
});
