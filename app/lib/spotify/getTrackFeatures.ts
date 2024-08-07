import { SpotifyTrackFeaturesResponseType } from "~/types/spotify";

export async function getTrackFeatures(accessToken: string, ids?: string[]) {
  const request = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${ids?.join(",")}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const response: SpotifyTrackFeaturesResponseType = await request.json();

  return response || null;
}
