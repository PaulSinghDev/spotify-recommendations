import { SpotifyRecentlyPlayedResponse } from "~/types/spotify";

export async function getRecentlyPlayed(accessToken: string, limit?: number) {
  const request = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit || 50}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const response: SpotifyRecentlyPlayedResponse = await request.json();

  return response || null;
}
