import { describe, expect, test } from 'bun:test';
import { podcastEpisodes } from '../src/data/podcast';

describe('podcast episode catalog', () => {
  test('keeps Episode 7 first with its approved destinations and participants', () => {
    const episode = podcastEpisodes[0];

    expect(episode).toMatchObject({
      number: 7,
      slug: 'episode-7',
      title: 'Unfiltered Q&A with OpenClaw Founder Peter Steinberger',
      airedAt: '2026-08-12',
      youtubeUrl: 'https://www.youtube.com/watch?v=WhkfUnKJuoY',
      spotifyUrl: 'https://open.spotify.com/episode/5mA2L9xmW76nq4erEKb3MP',
    });
    expect(episode.hosts.map(({ name }) => name)).toEqual([
      'Hannes Rudolph',
      'Patrick Erichsen',
    ]);
    expect(episode.guests.map(({ name }) => name)).toEqual(['Peter Steinberger']);
    expect(episode.description).toContain('An unfiltered Q&A with Peter Steinberger');
    expect(episode.description).toContain('Together, they cover');
  });
});
