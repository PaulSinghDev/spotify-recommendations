// app/routes/_index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ReactConfetti from "react-confetti";
import { AddPlaylistForm } from "~/components/add-playlist-form";
import { AnchorLink } from "~/components/ui/anchor-link";
import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getRecommendationFeatureAveragesFromTracks } from "~/lib/spotify/getRecommendationFeatureAveragesFromTracks";
import { getRecommendationFeaturesString } from "~/lib/spotify/getRecommendationFeatureString";
import { mergeTrackFeaturesAndDetails } from "~/lib/spotify/mergeTrackFeaturesAndDetails";
import { spotifyStrategy } from "~/services/auth.server";
import {
  SpotifyFullArtistType,
  SpotifyRecommendationFeatureAveragesType,
  SpotifyTrackType,
} from "~/types/spotify";

export async function loader({ request }: LoaderFunctionArgs) {
  // get a spotify session which is authenticated
  const session = await spotifyStrategy.getSession(request);

  // No session, fucked up
  if (!session) return null;

  return {
    session,
  };
}

export default function Index() {
  const [recommendationDialogOpen, setRecommendationDialogOpen] =
    useState(false);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topTracks, setTopTracks] = useState<SpotifyTrackType[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyFullArtistType[]>([]);
  const [tracksForFeatures, setTracksForFeatures] = useState<
    [string, number][]
  >([]);
  const [artistsForFeatures, setArtistsForFeatures] = useState<
    [string, number][]
  >([]);
  const [genresForFeatures, setGenresForFeatures] = useState<
    [string, number][]
  >([]);
  const [genres, setGenres] = useState<[string, number][]>([]);
  const [audioFeatures, setAudioFeatures] =
    useState<SpotifyRecommendationFeatureAveragesType>();
  const [recommendedPlaylist, setRecommendedPlaylist] = useState<
    SpotifyTrackType[]
  >([]);
  const [recommendationTrackCount, setRecommendationTrackCount] = useState(20);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistError, setPlaylistError] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [genreDialogOpen, setGenreDialogOpen] = useState(false);
  const [tracksDialogOpen, setTracksDialogOpen] = useState(false);
  const [artistsDialogOpen, setArtistsDialogOpen] = useState(false);

  const data = useLoaderData<typeof loader>();
  const user = data?.session?.user;

  return (
    <main className="bg-gradient-to-br from-zinc-900 to-zinc-950 min-h-screen text-white max-w-full">
      {playlistCreated ? <ReactConfetti style={{ zIndex: 100 }} /> : null}
      <div className="max-w-[1200px] mx-auto">
        <header className="px-8 pt-24 flex flex-col items-center">
          <div className="max-w-[600px] w-full mr-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-pretty mb-4">
              Spotify Song Recommendations
            </h2>
            <p className="font-thin">
              Get song recommendations based on your recent listening history
              or, you know, just put some shit in some boxes and press go!
            </p>
            <div className="mt-6 flex gap-4 flex-col md:flex-row">
              <Form
                action={user ? "/logout" : "/auth/spotify"}
                method="post"
                className="text-left grow flex max-w-full"
              >
                <Button
                  variant={user ? "destructive" : "positive"}
                  className="flex w-full grow"
                >
                  {user ? "Logout" : "Log in to get started"}
                </Button>
              </Form>
              {data?.session.accessToken ? (
                <Button
                  variant={"secondary"}
                  className="grow"
                  onClick={async () => {
                    setIsLoading(true);
                    // Top tracks
                    const topTracksRequest = await fetch("/api/v1/top-tracks");
                    const topTracksResponse = await topTracksRequest.json();
                    const tracks: SpotifyTrackType[] = [];

                    if (topTracksResponse.data.length) {
                      tracks.push(...topTracksResponse.data);
                    }

                    // Top artists
                    const topArtistsRequest = await fetch(
                      "/api/v1/top-artists"
                    );
                    const topArtistsResponse = await topArtistsRequest.json();
                    const artists: SpotifyFullArtistType[] = [];

                    if (topArtistsResponse.data.length) {
                      artists.push(...topArtistsResponse.data);
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
                            !tracks.find((track) => track.id === toCheck.id)
                        );

                      tracks.push(...tracksNotInState);

                      setTopTracks(tracks);
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
                        ...artists,
                        ...recentlyPlayedArtistsResponse.data,
                      ].reduce(
                        (output: SpotifyFullArtistType[], current) =>
                          !output.find((a) => a.id === current.id)
                            ? [...output, current]
                            : output,
                        []
                      );

                      setTopArtists(withoutDupes);
                    }

                    // Top 5 tracks
                    const tracksWithCount = tracks
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

                    setTracksForFeatures(tracksWithCount.slice(0, 2));

                    // Top 5 genres
                    const genresWithCount = [
                      ...topArtistsResponse.data.map(
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

                    setGenres(genresWithCount);
                    setGenresForFeatures(genresWithCount.slice(0, 1));

                    // Top 5 artists
                    const artistsWithCount = artists
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

                    setArtistsForFeatures(artistsWithCount.slice(0, 2));

                    // Audio features
                    const audioFeaturesRequest = await fetch(
                      `/api/v1/track-features?ids=${[
                        ...topTracksResponse.data,
                        ...recentlyPlayedTracksResponse.data,
                      ]
                        .map((track) => track.id)
                        .join(",")}`
                    );
                    const audioFeaturesResponse =
                      await audioFeaturesRequest.json();

                    // Do we have data?
                    if (audioFeaturesResponse.data.length) {
                      // Yup, merge with tracks so we can tally popularity
                      const mergedWithTracks = mergeTrackFeaturesAndDetails(
                        [
                          ...topTracksResponse.data,
                          ...recentlyPlayedTracksResponse.data,
                        ],
                        audioFeaturesResponse.data
                      );

                      // Get the averages
                      const averages =
                        getRecommendationFeatureAveragesFromTracks(
                          mergedWithTracks
                        );

                      // Set state
                      setAudioFeatures(averages);
                    }

                    setIsLoading(false);
                  }}
                >
                  Get Data
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="fixed top-0 left-0 bg-slate-950 bg-opacity-90 w-full h-full flex flex-col justify-center items-center">
            <span className="animate-spin border-slate-200 border-b-transparent border-8 rounded-full w-20 h-20"></span>
            <div className="mt-6 text-2xl font-bold text-slate-200">
              Please wait...
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {topTracks.length && topArtists.length && genres.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-8 max-w-[600px] font-thin text-xl mr-auto mt-12 col-span-full">
                <h2 className="font-bold text-4xl mb-4">Select Seed Items</h2>
                Use the section below to select your seed items. The seed items
                are used to create your recommendations. You are able to select
                a total of 5 items (this is a limitation in Spotify&apos;s API).
                For example, you could select two artists, two tracks and one
                genre.
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 px-8 col-span-full">
                {/* Genres */}
                {genres.length ? (
                  <div>
                    <Button
                      onClick={() => setGenreDialogOpen(true)}
                      className="w-full"
                      variant={"secondary"}
                    >
                      Select Genres
                    </Button>
                    <CommandDialog
                      open={genreDialogOpen}
                      onOpenChange={setGenreDialogOpen}
                    >
                      <CommandInput placeholder="Search genres" />
                      <CommandList>
                        <CommandGroup>
                          {genres.map((tuple) => {
                            const [genre] = tuple;

                            // Return a title
                            return (
                              <CommandItem
                                key={`genre-${genre}`}
                                className="flex gap-4 items-center capitalize"
                              >
                                {genresForFeatures.find(
                                  (feature) => feature[0] === genre
                                ) ? (
                                  <Button
                                    variant={"secondary"}
                                    size={"xs"}
                                    onClick={() => {
                                      setGenresForFeatures(
                                        genresForFeatures.filter(
                                          (feature) => feature[0] !== genre
                                        )
                                      );
                                    }}
                                  >
                                    <Icons.trash size={15} />
                                  </Button>
                                ) : tracksForFeatures.length +
                                    artistsForFeatures.length +
                                    genresForFeatures.length <
                                  5 ? (
                                  <Button
                                    size={"xs"}
                                    variant={"secondary"}
                                    onClick={() => {
                                      setGenresForFeatures([
                                        ...genresForFeatures,
                                        tuple,
                                      ]);
                                    }}
                                  >
                                    <Icons.add size={15} />
                                  </Button>
                                ) : (
                                  <Button
                                    size={"xs"}
                                    variant={"secondary"}
                                    disabled
                                  >
                                    <Icons.frown size={15} />
                                  </Button>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold">
                                    {genre}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </CommandDialog>
                  </div>
                ) : null}

                {/* Tracks */}
                {topTracks.length ? (
                  <div>
                    <Button
                      onClick={() => setTracksDialogOpen(true)}
                      className="w-full"
                      variant={"secondary"}
                    >
                      Select Tracks
                    </Button>
                    <CommandDialog
                      open={tracksDialogOpen}
                      onOpenChange={setTracksDialogOpen}
                    >
                      <CommandInput placeholder="Search tracks" />
                      <CommandList>
                        <CommandGroup>
                          {topTracks.map((track) => (
                            <CommandItem
                              key={`top-track-${track.id}`}
                              className="flex gap-4 items-center"
                            >
                              {tracksForFeatures.find(
                                (feature) => feature[0] === track.id
                              ) ? (
                                <Button
                                  variant={"secondary"}
                                  size={"xs"}
                                  onClick={() => {
                                    setTracksForFeatures(
                                      tracksForFeatures.filter(
                                        (feature) => feature[0] !== track.id
                                      )
                                    );
                                  }}
                                >
                                  <Icons.trash size={15} />
                                </Button>
                              ) : tracksForFeatures.length +
                                  artistsForFeatures.length +
                                  genresForFeatures.length <
                                5 ? (
                                <Button
                                  size={"xs"}
                                  variant={"secondary"}
                                  onClick={() => {
                                    setTracksForFeatures([
                                      ...tracksForFeatures,
                                      [track.id, 0],
                                    ]);
                                  }}
                                >
                                  <Icons.add size={15} />
                                </Button>
                              ) : (
                                <Button
                                  size={"xs"}
                                  variant={"secondary"}
                                  disabled
                                >
                                  <Icons.frown size={15} />
                                </Button>
                              )}
                              <div className="flex flex-col">
                                <span className="text-lg font-bold">
                                  {track.name}
                                </span>
                                <span className="text-sm text-grey">
                                  {track.artists
                                    .map((artist) => artist.name)
                                    .join(", ")}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </CommandDialog>
                  </div>
                ) : null}

                {/* Artists */}
                {topArtists.length ? (
                  <div>
                    <Button
                      onClick={() => setArtistsDialogOpen(true)}
                      className="w-full"
                      variant={"secondary"}
                    >
                      Select Artists
                    </Button>
                    <CommandDialog
                      open={artistsDialogOpen}
                      onOpenChange={setArtistsDialogOpen}
                    >
                      <CommandInput placeholder="Search artists" />
                      <CommandList>
                        <CommandGroup>
                          {topArtists.map((artist) => (
                            <li
                              key={`top-artist-${artist.id}`}
                              className="flex gap-4 items-center"
                            >
                              {artistsForFeatures.find(
                                (feature) => feature[0] === artist.id
                              ) ? (
                                <Button
                                  variant={"secondary"}
                                  size={"xs"}
                                  onClick={() => {
                                    setArtistsForFeatures(
                                      artistsForFeatures.filter(
                                        (feature) => feature[0] !== artist.id
                                      )
                                    );
                                  }}
                                >
                                  <Icons.trash size={15} />
                                </Button>
                              ) : tracksForFeatures.length +
                                  artistsForFeatures.length +
                                  genresForFeatures.length <
                                5 ? (
                                <Button
                                  size={"xs"}
                                  variant={"secondary"}
                                  onClick={() => {
                                    setArtistsForFeatures([
                                      ...artistsForFeatures,
                                      [artist.id, 0],
                                    ]);
                                  }}
                                >
                                  <Icons.add size={15} />
                                </Button>
                              ) : (
                                <Button
                                  size={"xs"}
                                  variant={"secondary"}
                                  disabled
                                >
                                  <Icons.frown size={15} />
                                </Button>
                              )}
                              <div className="flex flex-col">
                                <span className="text-lg font-bold">
                                  {artist.name}
                                </span>
                                <span className="text-sm text-grey capitalize">
                                  {artist.genres.join(", ")}
                                </span>
                              </div>
                            </li>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </CommandDialog>
                  </div>
                ) : null}

                {/* Audio Features */}
                {audioFeatures ? (
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant={"secondary"} className="w-full">
                          Select Audio Features
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Audio Features</DialogTitle>
                          <DialogDescription>
                            Use the section below to select your audio featured
                            as per Spotify&apos;s classification. The figures
                            below have been generated automatically based on
                            your recent listening history.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col">
                          <ul className="grid grid-cols-2 gap-4 bg-slate-300 p-6 rounded-md">
                            {audioFeatures
                              ? Object.keys(audioFeatures).map((featureKey) => {
                                  const average =
                                    audioFeatures[
                                      featureKey as keyof typeof audioFeatures
                                    ]?.average;

                                  return typeof average !== "undefined" ? (
                                    <li
                                      key={`audio-feature-${featureKey}`}
                                      className="inline-flex flex-col gap-2"
                                    >
                                      <span className="capitalize">
                                        {featureKey}:
                                      </span>
                                      <Input
                                        min={0}
                                        max={100}
                                        className="text-slate-700"
                                        value={average}
                                        type="number"
                                        onChange={(e) => {
                                          setAudioFeatures({
                                            ...audioFeatures,
                                            [featureKey]: {
                                              average: e.currentTarget.value,
                                            },
                                          });
                                        }}
                                      />
                                    </li>
                                  ) : null;
                                })
                              : null}
                          </ul>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : null}

                {/* Get recommendations */}
                {[
                  ...tracksForFeatures,
                  ...artistsForFeatures,
                  ...genresForFeatures,
                ].length && audioFeatures ? (
                  <Dialog
                    open={recommendationDialogOpen}
                    onOpenChange={setRecommendationDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant={"secondary"}>Get Recommendations</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Track Count</DialogTitle>
                        <DialogDescription>
                          How many tracks do you want to include in your
                          playlist? You must select between 10 and 100 tracks
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
                            setRecommendationTrackCount(
                              Number(e.currentTarget.value)
                            )
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={async () => {
                            setIsLoading(true);
                            setRecommendationDialogOpen(false);
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
                            setIsLoading(false);
                          }}
                        >
                          Recommend Me, Biatch
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
              {/* Seed Tracks */}
              <div className="flex flex-col p-8">
                <div className="flex gap-4">
                  <h2 className="font-bold text-2xl mb-2">Seed Tracks</h2>
                </div>
                {tracksForFeatures.length ? (
                  <ul className="flex flex-col gap-4">
                    {tracksForFeatures.map((tuple) => {
                      const [id] = tuple;

                      // Get a track object
                      const track = topTracks.find(
                        (trackObject) => trackObject.id === id
                      );

                      // No object
                      if (!track) return null;

                      // Return a title
                      return (
                        <li
                          key={`track-feature-track-${track.id}`}
                          className="flex gap-4 items-center"
                        >
                          <Button
                            variant={"secondary"}
                            size={"xs"}
                            onClick={() => {
                              setTracksForFeatures(
                                tracksForFeatures.filter(
                                  (feature) => feature[0] !== track.id
                                )
                              );
                            }}
                          >
                            <Icons.trash size={15} />
                          </Button>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold">
                              {track.name}
                            </span>
                            <span className="text-sm text-grey">
                              {track.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>
                    Select some tracks to use as seeds for your recommendations
                  </div>
                )}
              </div>
              {/* Seed Genres */}
              <div className="flex flex-col p-8">
                <div className="flex gap-4">
                  <h2 className="font-bold text-2xl mb-2">Seed Genres</h2>
                </div>
                {genresForFeatures.length ? (
                  <ul className="flex flex-col gap-4">
                    {genresForFeatures.map((tuple) => {
                      // Get details
                      const [id] = tuple;

                      // No object
                      if (!id) return null;

                      // Return a title
                      return (
                        <li
                          key={`genre-features-genre-${id}`}
                          className="flex gap-4 items-center capitalize"
                        >
                          <Button
                            variant={"secondary"}
                            size={"xs"}
                            onClick={() => {
                              setGenresForFeatures(
                                genresForFeatures.filter(
                                  (feature) => feature[0] !== id
                                )
                              );
                            }}
                          >
                            <Icons.trash size={15} />
                          </Button>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold">{id}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>
                    Select some genres to use as seeds for your recommendations
                  </div>
                )}
              </div>
              {/* Seed Artists */}
              <div className="flex flex-col p-8">
                <div className="flex gap-4">
                  <h2 className="font-bold text-2xl mb-2">Seed Artists</h2>
                </div>
                {artistsForFeatures.length ? (
                  <ul className="flex flex-col gap-4">
                    {artistsForFeatures.map((tuple) => {
                      const [id] = tuple;
                      // Get a track object
                      const artist = topArtists.find(
                        (trackObject) => trackObject.id === id
                      );

                      // No object
                      if (!artist) return null;

                      // Return a title
                      return (
                        <li
                          key={`feature-artist-${artist.id}`}
                          className="flex gap-4 items-center"
                        >
                          <Button
                            variant={"secondary"}
                            size={"xs"}
                            onClick={() => {
                              setArtistsForFeatures(
                                artistsForFeatures.filter(
                                  (feature) => feature[0] !== artist.id
                                )
                              );
                            }}
                          >
                            <Icons.trash size={15} />
                          </Button>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold">
                              {artist.name}
                            </span>
                            <span className="text-sm text-grey capitalize">
                              {artist.genres.join(", ")}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>
                    Select some artists to use as seeds for your recommendations
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Playlist */}
          {recommendedPlaylist.length ? (
            <div className="flex flex-col p-8">
              <div className="flex flex-col max-w-[600px]">
                <h2 className="font-bold text-4xl mb-4">Your Playlist</h2>
                Your playlist is below. Use the button to add it to your spotify
                account and listen to some choooonnnzzzz, fam!
                {recommendedPlaylist.length ? (
                  <Dialog
                    open={createPlaylistOpen}
                    onOpenChange={(open) => {
                      setCreatePlaylistOpen(open);
                      setPlaylistCreated(false);
                      setPlaylistError(false);
                    }}
                  >
                    <DialogTrigger asChild className="my-8 max-w-[300px]">
                      <Button variant={"secondary"}>Create Playlist</Button>
                    </DialogTrigger>
                    <DialogContent className="z-[101]">
                      {!playlistCreated && !playlistError ? (
                        <div>
                          <DialogHeader>
                            <DialogTitle>
                              Add This Playlist to Your Account
                            </DialogTitle>
                            <DialogDescription>
                              Enter a playlist name below and this playlist will
                              be added to your spotify account
                            </DialogDescription>
                          </DialogHeader>
                          <AddPlaylistForm
                            recommendations={recommendedPlaylist}
                            setIsLoading={setIsLoading}
                            setPlaylistCreated={setPlaylistCreated}
                            setPlaylistError={setPlaylistError}
                            setPlaylistUrl={setPlaylistUrl}
                          />
                        </div>
                      ) : null}
                      {playlistCreated ? (
                        <div>
                          <DialogHeader>
                            <DialogTitle>Playlist created</DialogTitle>
                            <DialogDescription>
                              Your playlist has been created and can be accessed
                              using the buttons below
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <div className="flex gap-4 mt-8">
                              <AnchorLink
                                variant={"button"}
                                href={playlistUrl}
                                title="Open playlist"
                                className="inline-flex shrink items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-1/2"
                              >
                                Open Playlist
                              </AnchorLink>
                              <Button
                                className="w-1/2 shrink"
                                onClick={() => {
                                  setCreatePlaylistOpen(false);
                                  setPlaylistCreated(false);
                                  setPlaylistError(false);
                                }}
                              >
                                Close
                              </Button>
                            </div>
                          </DialogFooter>
                        </div>
                      ) : null}
                      {playlistError ? (
                        <div>
                          <DialogHeader>
                            <DialogTitle>Something went wrong</DialogTitle>
                            <DialogDescription>
                              There was an error when making your playlist,
                              check that you have selected some seed tracks and
                              try again.
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
              {recommendedPlaylist.length ? (
                <ul className="grid md:grid-cols-2 gap-4 items-start">
                  {recommendedPlaylist.map((track) => {
                    // Return a title
                    return (
                      <li
                        key={`track-feature-track-${track.id}`}
                        className="flex gap-4 items-start bg-slate-800 p-4 rounded-lg h-full"
                      >
                        <Button
                          variant={"secondary"}
                          className="mt-2"
                          size={"xs"}
                          onClick={() => {
                            setRecommendedPlaylist(
                              recommendedPlaylist.filter(
                                (recc) => recc.id !== track.id
                              )
                            );
                          }}
                        >
                          <Icons.trash size={15} />
                        </Button>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">
                            {track.name}
                          </span>
                          <span className="text-sm text-grey">
                            {track.artists
                              .map((artist) => artist.name)
                              .join(", ")}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
