import { GetRecommendationsData } from "~/types/data";
import { SpotifyTrackType } from "~/types/spotify";
import { addArtistsToDb } from "./addArtistsToDb";
import { addTracksToDb } from "./addTracksToDb";
import { updateJob } from "../job-queue/update-job";
import { JobStatus } from "@prisma/client";
import { getRecommendationFeaturesString } from "./getRecommendationFeatureString";

export const getRecommendations = async (
  jobId: string,
  accessToken: string,
  userId: string,
  data: GetRecommendationsData
) => {
  // Update the job status/message
  await updateJob(jobId, {
    status: JobStatus.RUNNING,
    statusMsg: "Fetching recommendations...",
    progress: 25,
  });

  // Construct our query string
  const queryString = new URLSearchParams();

  // Add the seed tracks
  queryString.append("seed_tracks", data.trackIds.join(","));

  // Add the seed artists
  queryString.append("seed_artists", data.artistIds.join(","));

  // Add the limit
  queryString.append("limit", data.limit.toString());

  // Construct the URL
  const url = `https://api.spotify.com/v1/recommendations?${queryString.toString()}${
    data.features ? `&${getRecommendationFeaturesString(data.features)}` : ""
  }`;

  // request for recommendations
  const recommendationRequest = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Get the recommendations
  const recommendationResponse: { tracks: SpotifyTrackType[] } =
    await recommendationRequest.json();

  await updateJob(jobId, {
    status: JobStatus.RUNNING,
    statusMsg: "Updating database with new artists...",
    progress: 50,
  });

  // Get the artist IDs from the new tracks
  const artistIds = recommendationResponse.tracks
    .map((track) => track.artists.map((artist) => artist.id))
    .flat();

  // Add the new artists to the DB
  await addArtistsToDb(accessToken, userId, artistIds);

  await updateJob(jobId, {
    status: JobStatus.RUNNING,
    statusMsg: "Updating database with new tracks...",
    progress: 75,
  });

  // add the recommendations to the db
  await addTracksToDb(recommendationResponse.tracks, userId, accessToken);

  await updateJob(jobId, {
    status: JobStatus.COMPLETED,
    statusMsg: "Finished getting recommendations",
    progress: 100,
    data: { trackIds: recommendationResponse.tracks.map((track) => track.id) },
  });
};
