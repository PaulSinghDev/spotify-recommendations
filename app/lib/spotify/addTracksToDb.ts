import { SpotifyTrackType } from "~/types/spotify";
import { prisma } from "../prisma/client";
import { getTrackFeatures } from "./getTrackFeatures";

export const addTracksToDb = async (
  tracks: SpotifyTrackType[],
  userId: string,
  accessToken: string
) => {
  // Ensure prisma is defined
  if (!prisma) throw new Error("Prisma is not defined");

  // tracks to update
  const tracksToUpdate: string[] = [];

  // Tracks to create
  const tracksToCreate: ReturnType<typeof prisma.track.create>[] = [];

  for (const track of tracks) {
    // Does the track exist?
    const existingTrack = await prisma.track.findUnique({
      where: {
        id: track.id,
      },
    });

    // it does, continue
    if (existingTrack) {
      continue;
    }

    // tracks that need to just have the user connected
    const existsInDb =
      (await prisma?.track.count({
        where: {
          id: track.id,
        },
      })) === 1;

    // it exists in the db we will need to connect the user
    if (existsInDb) {
      tracksToUpdate.push(track.id);
      continue;
    }

    // get the audio features for the track
    const audioFeatures = await getTrackFeatures(accessToken, [track.id]);

    // it doesn't, add a promise to the array
    const promise = prisma?.track.create({
      data: {
        id: track.id,
        title: track.name,
        album: track.album.name,
        cover: track.album.images[0].url,
        url: track.preview_url,
        spotifyUri: track.uri,
        duration: track.duration_ms,
        features: {
          create: {
            acousticness: audioFeatures.audio_features[0].acousticness,
            danceability: audioFeatures.audio_features[0].danceability,
            energy: audioFeatures.audio_features[0].energy,
            instrumentalness: audioFeatures.audio_features[0].instrumentalness,
            liveness: audioFeatures.audio_features[0].liveness,
            loudness: audioFeatures.audio_features[0].loudness,
            speechiness: audioFeatures.audio_features[0].speechiness,
            tempo: audioFeatures.audio_features[0].tempo,
            valence: audioFeatures.audio_features[0].valence,
          },
        },
        users: {
          connect: {
            id: userId,
          },
        },
        artists: {
          connect: track.artists.map((artist) => ({
            id: artist.id,
          })),
        },
      },
    });

    tracksToCreate.push(promise);
  }

  await Promise.all(tracksToCreate);
  await Promise.all(tracksToUpdate);
};
