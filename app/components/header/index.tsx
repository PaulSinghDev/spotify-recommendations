import { Form } from "@remix-run/react";
import { Button } from "../ui/button";
import { User } from "remix-auth-spotify";
import {
  SpotifyFullArtistType,
  SpotifyRecommendationFeatureAveragesType,
  SpotifyTrackType,
} from "~/types/spotify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { mergeTrackFeaturesAndDetails } from "~/lib/spotify/mergeTrackFeaturesAndDetails";
import { getRecommendationFeatureAveragesFromTracks } from "~/lib/spotify/getRecommendationFeatureAveragesFromTracks";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { getRecommendationFeaturesString } from "~/lib/spotify/getRecommendationFeatureString";

export function Header({
  user,
  setTracks,
  setArtists,
  setGenres,
  setAudioFeatures,
  setTracksForFeatures,
  setGenresForFeatures,
  setArtistsForFeatures,
}: {
  user: User;
  setTracks: React.Dispatch<React.SetStateAction<SpotifyTrackType[]>>;
  setArtists: React.Dispatch<React.SetStateAction<SpotifyFullArtistType[]>>;
  setGenres: React.Dispatch<React.SetStateAction<string[]>>;
  setGenresForFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setTracksForFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setArtistsForFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setAudioFeatures: React.Dispatch<
    React.SetStateAction<SpotifyRecommendationFeatureAveragesType>
  >;
}) {
  const [recommendationTrackCount, setRecommendationTrackCount] = useState(20);

  return (
    <header className="px-8 pt-24 flex flex-col items-center">
      <div className="max-w-[600px]">
        <h2 className="text-5xl font-bold text-pretty mb-4">
          Spotify Song Recommendations
        </h2>
        <p className="font-light">
          Get song recommendations based on your recent listening history or,
          you know, just put some shit in some boxes and press go!
        </p>
        <div className="mt-6 flex gap-4">
          <Form
            action={user ? "/logout" : "/auth/spotify"}
            method="post"
            className="text-left"
          >
            <Button variant={user ? "destructive" : "positive"}>
              {user ? "Logout" : "Log in to get started"}
            </Button>
          </Form>
          <Button
            variant={"secondary"}
            onClick={async () => {
              // Top tracks
              const tempTracksRequest = await fetch("/api/v1/top-tracks");
              const tempTracksResponse = await tempTracksRequest.json();
              const tempTracks: SpotifyTrackType[] = [];

              if (tempTracksResponse.data.length) {
                tempTracks.push(...tempTracksResponse.data);
              }

              // Top artists
              const tempArtistsRequest = await fetch("/api/v1/top-artists");
              const tempArtistsResponse = await tempArtistsRequest.json();
              const tempArtists: SpotifyFullArtistType[] = [];

              if (tempArtistsResponse.data.length) {
                tempArtists.push(...tempArtistsResponse.data);
              }

              // Recently played tracks
              const recentlyPlayedTracksRequest = await fetch(
                "/api/v1/recently-played-tracks"
              );
              const recentlyPlayedTracksResponse =
                await recentlyPlayedTracksRequest.json();

              if (recentlyPlayedTracksResponse.data.length) {
                const tracksNotInState =
                  recentlyPlayedTracksResponse.data.filter(
                    (toCheck: SpotifyTrackType) =>
                      !tempTracks.find((track) => track.id === toCheck.id)
                  );

                tempTracks.push(...tracksNotInState);

                setTracks(tempTracks);
              }

              // recently played artists
              const recentlyPlayedArtistsRequest = await fetch(
                `/api/v1/artists?ids=${recentlyPlayedTracksResponse.data
                  .map((track: SpotifyTrackType) =>
                    track.artists.map((artist) => artist.id)
                  )
                  .flat()
                  .join(",")}`
              );
              const recentlyPlayedArtistsResponse =
                await recentlyPlayedArtistsRequest.json();

              if (recentlyPlayedArtistsResponse.data.length) {
                const withoutDupes = [
                  ...tempArtists,
                  ...recentlyPlayedArtistsResponse.data,
                ].reduce(
                  (output: SpotifyFullArtistType[], current) =>
                    !output.find((a) => a.id === current.id)
                      ? [...output, current]
                      : output,
                  []
                );

                setArtists(withoutDupes);
              }

              // Top 5 tracks
              const tracksWithCount = tempTracks
                .reduce((output: [string, number][], current) => {
                  let currentTuple = output.find(
                    (tuple) => tuple[0] === current.id
                  );
                  if (!currentTuple) {
                    currentTuple = [current.id, 0];
                    output.push(currentTuple);
                  }

                  currentTuple[1] += 1;

                  return output;
                }, [])
                .sort((a, b) => b[1] - a[1]);

              setTracksForFeatures(
                tracksWithCount.slice(0, 2).map((track) => track[0])
              );

              // Top 5 genres
              const genresWithCount = [
                ...tempArtistsResponse.data.map(
                  (artist: SpotifyFullArtistType) => artist.genres
                ),
                ...recentlyPlayedArtistsResponse.data.map(
                  (artist: SpotifyFullArtistType) => artist.genres
                ),
              ]
                .flat()
                .reduce((output: [string, number][], current) => {
                  let currentTuple = output.find(
                    (tuple) => tuple[0] === current
                  );
                  if (!currentTuple) {
                    currentTuple = [current, 0];
                    output.push(currentTuple);
                  }

                  currentTuple[1] += 1;

                  return output;
                }, [])
                .sort((a, b) => b[1] - a[1]);

              setGenres(genresWithCount.map((genre) => genre[0]));
              setGenresForFeatures(
                genresWithCount.slice(0, 1).map((genre) => genre[0])
              );

              // Top 5 artists
              const artistsWithCount = tempArtists
                .reduce((output: [string, number][], current) => {
                  let currentTuple = output.find(
                    (tuple) => tuple[0] === current.id
                  );

                  if (!currentTuple) {
                    currentTuple = [current.id, 0];
                    output.push(currentTuple);
                  }

                  currentTuple[1] += 1;

                  return output;
                }, [])
                .sort((a, b) => b[1] - a[1]);

              setArtistsForFeatures(
                artistsWithCount.slice(0, 2).map((artist) => artist[0])
              );

              // Audio features
              const audioFeaturesRequest = await fetch(
                `/api/v1/track-features?ids=${[
                  ...tempTracksResponse.data,
                  ...recentlyPlayedTracksResponse.data,
                ]
                  .map((track) => track.id)
                  .join(",")}`
              );
              const audioFeaturesResponse = await audioFeaturesRequest.json();

              // Do we have data?
              if (audioFeaturesResponse.data.length) {
                // Yup, merge with tracks so we can tally popularity
                const mergedWithTracks = mergeTrackFeaturesAndDetails(
                  [
                    ...tempTracksResponse.data,
                    ...recentlyPlayedTracksResponse.data,
                  ],
                  audioFeaturesResponse.data
                );

                // Get the averages
                const averages =
                  getRecommendationFeatureAveragesFromTracks(mergedWithTracks);

                // Set state
                setAudioFeatures(averages);
              }
            }}
          >
            Get Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"secondary"}>Get Recommendations</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Track Count</DialogTitle>
                <DialogDescription>
                  How many tracks do you want to include in your playlist? You
                  must select between 10 and 100 tracks
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label>Track Count</Label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={recommendationTrackCount}
                  onChange={(e) =>
                    setRecommendationTrackCount(Number(e.currentTarget.value))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    const recommendationFeatureString = audioFeatures
                      ? getRecommendationFeaturesString(audioFeatures)
                      : null;

                    const recommendationGenresString = `seed_genres=${genresForFeatures
                      .map((id) => id[0])
                      .join(",")}`;

                    const recommendationArtistsString = `seed_artists=${artistsForFeatures
                      .map((id) => id[0])
                      .join(",")}`;

                    const recommendationTracksString = `seed_tracks=${tracksForFeatures
                      .map((id) => id[0])
                      .join(",")}`;

                    const queryString = new URLSearchParams(
                      `${recommendationFeatureString}&${recommendationArtistsString}&${recommendationGenresString}&${recommendationTracksString}&limit=${recommendationTrackCount}`
                    );

                    const request = await fetch(
                      `/api/v1/get-recommendations?${queryString}`
                    );

                    const response = await request.json();

                    if (response.data.length) {
                      setRecommendedPlaylist(response.data);
                    }
                  }}
                >
                  Recommend Me, Biatch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"secondary"}>Create Playlist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add This Playlist to Your Account</DialogTitle>
                <DialogDescription>
                  Enter a playlist name below and this playlist will be added to
                  your spotify account
                </DialogDescription>
              </DialogHeader>
              <AddPlaylistForm recommendations={recommendedPlaylist} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
