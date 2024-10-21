import { SpotifyRecommendationFeatureAveragesType } from "./spotify";

export type GenericAPIResponse<T> = {
  success: boolean;
  data: T;
};

export type GetRecommendationsData = {
  trackIds: string[];
  artistIds: string[];
  genreIds: string[];
  features: SpotifyRecommendationFeatureAveragesType;
  limit: number;
};
export const isGetRecommendationsData = (
  data: unknown
): data is GetRecommendationsData => {
  return (
    data instanceof Object && "trackIds" in data && Array.isArray(data.trackIds)
  );
};

export type GetRecommendationsCompletedData = {
  trackIds: string[];
};
export const isGetRecommendationsCompletedData = (
  data: unknown
): data is GetRecommendationsCompletedData => {
  return (
    data instanceof Object && "trackIds" in data && Array.isArray(data.trackIds)
  );
};

export type CreatePlaylistData = {
  playlistName: string;
  isPrivatePlaylist: boolean;
  trackUris: string[];
};
export const isCreatePlaylistData = (
  data: unknown
): data is CreatePlaylistData => {
  return (
    data instanceof Object &&
    "playlistName" in data &&
    typeof data.playlistName === "string" &&
    "isPrivatePlaylist" in data &&
    typeof data.isPrivatePlaylist === "boolean" &&
    "trackUris" in data &&
    Array.isArray(data.trackUris)
  );
};
