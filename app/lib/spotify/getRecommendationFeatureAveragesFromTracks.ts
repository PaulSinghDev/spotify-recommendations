import {
  SpotifyRecommendationFeatureAveragesType,
  SpotifyTrackWithFeaturesType,
} from "~/types/spotify";

export const getRecommendationFeatureAveragesFromTracks = (
  tracks: SpotifyTrackWithFeaturesType[]
) => {
  const output: SpotifyRecommendationFeatureAveragesType = {};

  // Iterate all tracks to get an object with averages of the features
  for (const [i, track] of tracks.entries()) {
    // No acousticness
    if (!output.acousticness) {
      output.acousticness = {
        min: track.features.acousticness,
        max: track.features.acousticness,
        average: track.features.acousticness,
        sum: track.features.acousticness,
      };
    }

    // No danceability
    if (!output.danceability) {
      output.danceability = {
        min: track.features.danceability,
        max: track.features.danceability,
        average: track.features.danceability,
        sum: track.features.danceability,
      };
    }

    // No energy
    if (!output.energy) {
      output.energy = {
        min: track.features.energy,
        max: track.features.energy,
        average: track.features.energy,
        sum: track.features.energy,
      };
    }

    // No instrumentalness
    if (!output.instrumentalness) {
      output.instrumentalness = {
        min: track.features.instrumentalness,
        max: track.features.instrumentalness,
        average: track.features.instrumentalness,
        sum: track.features.instrumentalness,
      };
    }

    // No liveness
    if (!output.liveness) {
      output.liveness = {
        min: track.features.liveness,
        max: track.features.liveness,
        average: track.features.liveness,
        sum: track.features.liveness,
      };
    }

    // No key
    if (!output.key) {
      output.key = {
        min: track.features.key,
        max: track.features.key,
        average: track.features.key,
        sum: track.features.key,
      };
    }

    // No popularity
    if (!output.popularity) {
      output.popularity = {
        min: track.popularity,
        max: track.popularity,
        average: track.popularity,
        sum: track.popularity,
      };
    }

    // No speechiness
    if (!output.speechiness) {
      output.speechiness = {
        min: track.features.speechiness,
        max: track.features.speechiness,
        average: track.features.speechiness,
        sum: track.features.speechiness,
      };
    }

    // No valence
    if (!output.valence) {
      output.valence = {
        min: track.features.valence,
        max: track.features.valence,
        average: track.features.valence,
        sum: track.features.valence,
      };
    }

    // acousticness
    if (
      typeof output.acousticness.min !== "undefined" &&
      track.features.acousticness < output.acousticness.min
    ) {
      output.acousticness.min = track.features.acousticness;
    }

    if (
      typeof output.acousticness.max !== "undefined" &&
      track.features.acousticness > output.acousticness.max
    ) {
      output.acousticness.max = track.features.acousticness;
    }

    if (typeof output.acousticness.sum !== "undefined") {
      output.acousticness.sum += track.features.acousticness;
    }

    if (
      typeof output.acousticness.average !== "undefined" &&
      typeof output.acousticness.sum !== "undefined"
    ) {
      output.acousticness.average = Math.round(
        (output.acousticness.sum / (i + 1)) * 100
      );
    }

    // danceability
    if (
      typeof output.danceability.min !== "undefined" &&
      track.features.danceability < output.danceability.min
    ) {
      output.danceability.min = track.features.danceability;
    }

    if (
      typeof output.danceability.max !== "undefined" &&
      track.features.danceability > output.danceability.max
    ) {
      output.danceability.max = track.features.danceability;
    }

    if (typeof output.danceability.sum !== "undefined") {
      output.danceability.sum += track.features.danceability;
    }

    if (
      typeof output.danceability.average !== "undefined" &&
      typeof output.danceability.sum !== "undefined"
    ) {
      output.danceability.average = Math.round(
        (output.danceability.sum / (i + 1)) * 100
      );
    }

    // energy
    if (
      typeof output.energy.min !== "undefined" &&
      track.features.energy < output.energy.min
    ) {
      output.energy.min = track.features.energy;
    }

    if (
      typeof output.energy.max !== "undefined" &&
      track.features.energy > output.energy.max
    ) {
      output.energy.max = track.features.energy;
    }

    if (typeof output.energy.sum !== "undefined") {
      output.energy.sum += track.features.energy;
    }

    if (
      typeof output.energy.average !== "undefined" &&
      typeof output.energy.sum !== "undefined"
    ) {
      output.energy.average = Math.round((output.energy.sum / (i + 1)) * 100);
    }

    // instrumentalness
    if (
      typeof output.instrumentalness.min !== "undefined" &&
      track.features.instrumentalness < output.instrumentalness.min
    ) {
      output.instrumentalness.min = track.features.instrumentalness;
    }

    if (
      typeof output.instrumentalness.max !== "undefined" &&
      track.features.instrumentalness > output.instrumentalness.max
    ) {
      output.instrumentalness.max = track.features.instrumentalness;
    }

    if (typeof output.instrumentalness.sum !== "undefined") {
      output.instrumentalness.sum += track.features.instrumentalness;
    }

    if (
      typeof output.instrumentalness.average !== "undefined" &&
      typeof output.instrumentalness.sum !== "undefined"
    ) {
      output.instrumentalness.average = Math.round(
        (output.instrumentalness.sum / (i + 1)) * 100
      );
    }

    // liveness
    if (
      typeof output.liveness.min !== "undefined" &&
      track.features.liveness < output.liveness.min
    ) {
      output.liveness.min = track.features.liveness;
    }

    if (
      typeof output.liveness.max !== "undefined" &&
      track.features.liveness > output.liveness.max
    ) {
      output.liveness.max = track.features.liveness;
    }

    if (typeof output.liveness.sum !== "undefined") {
      output.liveness.sum += track.features.liveness;
    }

    if (
      typeof output.liveness.average !== "undefined" &&
      typeof output.liveness.sum !== "undefined"
    ) {
      output.liveness.average = Math.round(
        (output.liveness.sum / (i + 1)) * 100
      );
    }

    // key
    if (
      typeof output.key.min !== "undefined" &&
      track.features.key < output.key.min
    ) {
      output.key.min = track.features.key;
    }

    if (
      typeof output.key.max !== "undefined" &&
      track.features.key > output.key.max
    ) {
      output.key.max = track.features.key;
    }

    if (typeof output.key.sum !== "undefined") {
      output.key.sum += track.features.key;
    }

    if (
      typeof output.key.average !== "undefined" &&
      typeof output.key.sum !== "undefined"
    ) {
      output.key.average = Math.round(output.key.sum / (i + 1));
    }

    // popularity
    if (
      typeof output.popularity.min !== "undefined" &&
      track.popularity < output.popularity.min
    ) {
      output.popularity.min = track.popularity;
    }

    if (
      typeof output.popularity.max !== "undefined" &&
      track.popularity > output.popularity.max
    ) {
      output.popularity.max = track.popularity;
    }

    if (typeof output.popularity.sum !== "undefined") {
      output.popularity.sum += track.popularity;
    }

    if (
      typeof output.popularity.average !== "undefined" &&
      typeof output.popularity.sum !== "undefined"
    ) {
      output.popularity.average = Math.round(output.popularity.sum / (i + 1));
    }

    // speechiness
    if (
      typeof output.speechiness.min !== "undefined" &&
      track.features.speechiness < output.speechiness.min
    ) {
      output.speechiness.min = track.features.speechiness;
    }

    if (
      typeof output.speechiness.max !== "undefined" &&
      track.features.speechiness > output.speechiness.max
    ) {
      output.speechiness.max = track.features.speechiness;
    }

    if (typeof output.speechiness.sum !== "undefined") {
      output.speechiness.sum += track.features.speechiness;
    }

    if (
      typeof output.speechiness.average !== "undefined" &&
      typeof output.speechiness.sum !== "undefined"
    ) {
      output.speechiness.average = Math.round(
        (output.speechiness.sum / (i + 1)) * 100
      );
    }

    // valence
    if (
      typeof output.valence.min !== "undefined" &&
      track.features.valence < output.valence.min
    ) {
      output.valence.min = track.features.valence;
    }

    if (
      typeof output.valence.max !== "undefined" &&
      track.features.valence > output.valence.max
    ) {
      output.valence.max = track.features.valence;
    }

    if (typeof output.valence.sum !== "undefined") {
      output.valence.sum += track.features.acousticness;
    }

    if (
      typeof output.valence.average !== "undefined" &&
      typeof output.valence.sum !== "undefined"
    ) {
      output.valence.average = Math.round((output.valence.sum / (i + 1)) * 100);
    }
  }

  return output;
};
