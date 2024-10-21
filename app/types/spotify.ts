import { JobStatus } from "@prisma/client";

export type SpotifyTopTracksResponse = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: SpotifyTrackType[];
};

export type SpotifyTopArtistsResponse = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: SpotifyFullArtistType[];
};

export type SpotifyImageType = {
  height: number;
  url: string;
  width: number;
};

export type SpotifyExternalUrlType = {
  spotify: string;
};

export type SpotifyArtistType = {
  external_urls: SpotifyExternalUrlType;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
};

export type SpotifyAlbumType = {
  album_type: string;
  artists: SpotifyArtistType[];
  available_markets: string[];
  external_urls: SpotifyExternalUrlType;
  href: string;
  id: string;
  images: SpotifyImageType[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
};

export type SpotifyTrackType = {
  album: SpotifyAlbumType;
  artists: SpotifyArtistType[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: SpotifyExternalUrlType;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
};

export type SpotifyTrackWithMetaType = {
  track: SpotifyTrackType;
  played_at: string;
  context: unknown | null;
};

export type SpotifyRecentlyPlayedResponse = {
  items: SpotifyTrackWithMetaType[];
  next: string;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
};

export type SpotifyTrackFeaturesType = {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: string;
  uri: string;
  valence: number;
};

export type SpotifyTrackFeaturesResponseType = {
  audio_features: SpotifyTrackFeaturesType[];
};

export type SpotifyFollowerType = {
  href: string | null;
  total: number;
};

export type SpotifyFullArtistType = {
  external_urls: SpotifyExternalUrlType;
  followers: SpotifyFollowerType[];
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImageType[];
  popularity: number;
  name: string;
  type: string;
  uri: string;
};

export type SpotifyArtistResponseType = { artists: SpotifyFullArtistType[] };

export type SpotifyRecommendationFeatureArgType = {
  min?: number;
  max?: number;
  average?: number;
  sum?: number;
};

export type SpotifyRecommendationFeatureAveragesType = {
  danceability?: SpotifyRecommendationFeatureArgType;
  acousticness?: SpotifyRecommendationFeatureArgType;
  energy?: SpotifyRecommendationFeatureArgType;
  instrumentalness?: SpotifyRecommendationFeatureArgType;
  liveness?: SpotifyRecommendationFeatureArgType;
  key?: SpotifyRecommendationFeatureArgType;
  popularity?: SpotifyRecommendationFeatureArgType;
  speechiness?: SpotifyRecommendationFeatureArgType;
  valence?: SpotifyRecommendationFeatureArgType;
};

export type SpotifyTrackWithFeaturesType = SpotifyTrackType & {
  features: SpotifyTrackFeaturesType;
};

export type SpotifyCreatePlaylistResponse = {
  collaborative: false;
  description: string;
  external_urls: SpotifyExternalUrlType;
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: SpotifyImageType[];
  name: string;
  owner: {
    external_urls: SpotifyExternalUrlType;
    followers: {
      href: string;
      total: number;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string;
  };
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
    items: {
      added_at: string;
      added_by: {
        external_urls: SpotifyExternalUrlType;
        followers: SpotifyFollowerType;
        href: string;
        id: string;
        type: string;
        uri: string;
      };
      is_local: boolean;
      track: SpotifyTrackType;
    }[];
  };
  type: string;
  uri: string;
};

export const isJobStatus = (status: string): status is JobStatus => {
  return Object.values(JobStatus).includes(status as JobStatus);
};
