import { SpotifyTopArtistsResponse } from "~/types/spotify";

export const getTopArtists = async (accessToken: string) => {
  const request = await fetch(
    "https://api.spotify.com/v1/me/top/artists?limit=50&term=medium_term",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const response: SpotifyTopArtistsResponse = await request.json();

  return response;
};
