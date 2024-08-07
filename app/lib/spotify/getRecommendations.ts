import { SpotifyTrackType } from "~/types/spotify";

export const getRecommendations = async (
  queryString: URLSearchParams,
  accessToken: string
) => {
  // request for recommendations
  const recommendationRequest = await fetch(
    `https://api.spotify.com/v1/recommendations?${queryString.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const recommendationResponse: { tracks: SpotifyTrackType[] } =
    await recommendationRequest.json();

  return recommendationResponse.tracks;
};
