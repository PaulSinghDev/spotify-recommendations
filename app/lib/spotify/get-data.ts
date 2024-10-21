import { SpotifyFullArtistType, SpotifyTrackType } from "~/types/spotify";
import { updateJob } from "../job-queue/update-job";
import { JobStatus } from "@prisma/client";
import { getTopTracks } from "./getTopTracks";
import { addArtistsToDb } from "./addArtistsToDb";
import { addTracksToDb } from "./addTracksToDb";
import { getTopArtists } from "./getTopArtists";
import { getRecentlyPlayed } from "./getRecentlyPlayed";

export const getData = async (
  id: string,
  accessToken: string,
  userId: string
) => {
  try {
    // Update the job status/message
    await updateJob(id, {
      status: JobStatus.RUNNING,
      statusMsg: "Fetching top tracks...",
      progress: 25,
    });

    /**
     * TRACKS
     */
    const tracks: SpotifyTrackType[] = [];

    // Authenticated, try get tracks
    const tracksResponse = await getTopTracks(accessToken);

    // Ge all artistIds
    const artistIds = tracksResponse.items
      .map((track) => track.artists.map((artist) => artist.id))
      .flat();

    // Add our artists to the DB
    await addArtistsToDb(accessToken, userId, artistIds);

    // Now we know all artists are in our DB we can continue with adding them to
    // our tracks
    await addTracksToDb(tracksResponse.items, userId, accessToken);

    if (tracksResponse.items?.length) {
      tracks.push(...tracksResponse.items);
    }

    /**
     * ARTISTS
     */

    // Update the job message
    await updateJob(id, {
      statusMsg: "Fetching top artists...",
      progress: 50,
    });

    // Top artists
    const artistsResponse = await getTopArtists(accessToken);
    const artists: SpotifyFullArtistType[] = [];

    if (artistsResponse?.items?.length) {
      artists.push(...artistsResponse.items);
    }

    /**
     * RECENTLY PLAYED
     */

    // Update the job message
    await updateJob(id, {
      statusMsg: "Fetching recently played tracks...",
      progress: 75,
    });

    // Recently played tracks
    const recentlyPlayedTracksResponse = await getRecentlyPlayed(accessToken);

    const recentlyPlayedArtistIds = recentlyPlayedTracksResponse.items
      .map(({ track }) => track.artists.map((artist) => artist.id))
      .flat();

    await addArtistsToDb(accessToken, userId, recentlyPlayedArtistIds);

    await addTracksToDb(
      recentlyPlayedTracksResponse.items.map(({ track }) => track),
      userId,
      accessToken
    );

    // Update the job message
    await updateJob(id, {
      status: JobStatus.COMPLETED,
      statusMsg: "Finished fetching data",
      progress: 100,
    });
  } catch (error) {
    console.error(error);
  }
};
