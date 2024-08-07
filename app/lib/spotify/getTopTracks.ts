import { SpotifyTopTracksResponse } from "~/types/spotify";

export const getTopTracks = async (accessToken: string) => {
  const request = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?limit=50&term=medium_term",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const response: SpotifyTopTracksResponse = await request.json();

  return response;
};
