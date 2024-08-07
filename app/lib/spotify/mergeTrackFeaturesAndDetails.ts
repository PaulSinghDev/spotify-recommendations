import {
  SpotifyTrackFeaturesType,
  SpotifyTrackType,
  SpotifyTrackWithFeaturesType,
} from "~/types/spotify";

export const mergeTrackFeaturesAndDetails = (
  tracks: SpotifyTrackType[],
  features: SpotifyTrackFeaturesType[]
): SpotifyTrackWithFeaturesType[] => {
  return tracks.map(
    (track) =>
      ({
        ...track,
        features: features.find((feat) => feat.id === track.id),
      } as SpotifyTrackWithFeaturesType)
  );
};
