import { SpotifyArtistResponseType } from "~/types/spotify";

export async function getArtistsFromIds(accessToken: string, ids?: string[]) {
  const request = await fetch(
    `https://api.spotify.com/v1/artists?ids=${ids?.join(",")}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const response: SpotifyArtistResponseType = await request.json();

  return response.artists || null;
}
