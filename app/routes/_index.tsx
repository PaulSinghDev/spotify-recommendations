// app/routes/_index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
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
import { Switch } from "~/components/ui/switch";
import { getRecommendationFeatureAveragesFromTracks } from "~/lib/spotify/getRecommendationFeatureAveragesFromTracks";
import { mergeTrackFeaturesAndDetails } from "~/lib/spotify/mergeTrackFeaturesAndDetails";
import { spotifyStrategy } from "~/services/auth.server";
import {
  SpotifyFullArtistType,
  SpotifyRecommendationFeatureAveragesType,
  SpotifyTrackType,
} from "~/types/spotify";

const getRecommendationFeaturesString = (
  features: SpotifyRecommendationFeatureAveragesType
) => {
  const output = new URLSearchParams();

  // Get the defined keys
  const keys = Object.keys(features);

  // Iterate the keys
  keys.forEach((key) => {
    // get the object for the key
    const data =
      features[key as keyof SpotifyRecommendationFeatureAveragesType];

    // Add the search param if all is defined
    if (
      data &&
      typeof data.min !== "undefined" &&
      typeof data.max !== "undefined" &&
      typeof data.average !== "undefined"
    ) {
      output.append(`min_${key}`, data.min.toString());
      output.append(`max_${key}`, data.max.toString());
      output.append(`target_${key}`, data.average.toString());
    }
  });

  // return the string
  return output.toString();
};

export async function loader({ request }: LoaderFunctionArgs) {
  // get a spotify session which is authenticated
  const session = await spotifyStrategy.getSession(request);

  // No session, fucked up
  if (!session) return null;

  return {
    session,
  };
}

function AddPlaylistForm({
  recommendations,
}: {
  recommendations: SpotifyTrackType[];
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [isPrivatePlaylist, setIsPrivatePlaylist] = useState(true);

  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={async () => {
        const ids = recommendations.map((track) => track.uri).join(",");
        const urlParams = new URLSearchParams(
          `tracks=${ids}&name=${playlistName}&isPrivate=${isPrivatePlaylist}`
        );

        const request = await fetch(
          `/api/v1/create-playlist?${urlParams.toString()}`
        );
        const response = await request.json();

        console.log(response);
      }}
    >
      <div>
        <Label>Playlist Name</Label>
        <Input
          required
          type="text"
          name="name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.currentTarget.value)}
        />
      </div>
      <div className="flex gap-4 items-center">
        <Switch
          checked={isPrivatePlaylist}
          onCheckedChange={setIsPrivatePlaylist}
        />
        <Label>Is the playlist private?</Label>
      </div>
      <Button>Create Playlist</Button>
    </Form>
  );
}

export default function Index() {
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

  const data = useLoaderData<typeof loader>();
  const user = data?.session?.user;

  return (
    <main className="bg-gradient-to-br from-zinc-900 to-zinc-950 min-h-screen text-white">
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
                const topTracksRequest = await fetch("/api/v1/top-tracks");
                const topTracksResponse = await topTracksRequest.json();
                const tracks: SpotifyTrackType[] = [];

                if (topTracksResponse.data.length) {
                  tracks.push(...topTracksResponse.data);
                }

                // Top artists
                const topArtistsRequest = await fetch("/api/v1/top-artists");
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
                const audioFeaturesResponse = await audioFeaturesRequest.json();

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
                    Enter a playlist name below and this playlist will be added
                    to your spotify account
                  </DialogDescription>
                </DialogHeader>
                <AddPlaylistForm recommendations={recommendedPlaylist} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Playlist */}
      <div className="flex flex-col p-8">
        <div className="flex gap-4">
          <h2 className="font-bold text-2xl mb-2">Your Playlist</h2>
        </div>
        {recommendedPlaylist.length ? (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
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
                    <span className="text-lg font-bold">{track.name}</span>
                    <span className="text-sm text-grey">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>
            Select 5 tracks to be used for you recommendations from the list
            below
          </div>
        )}
      </div>

      {/* Audio Features */}
      {audioFeatures ? (
        <div className="flex flex-col p-8">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl mb-2">Audio Features</h2>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-slate-700 p-6 rounded-md">
            {audioFeatures
              ? Object.keys(audioFeatures).map((featureKey) => {
                  const average =
                    audioFeatures[featureKey as keyof typeof audioFeatures]
                      ?.average;

                  return typeof average !== "undefined" ? (
                    <li
                      key={`audio-feature-${featureKey}`}
                      className="inline-flex gap-2"
                    >
                      <span className="capitalize">{featureKey}:</span>
                      <Input
                        pattern="^\d+(\.\d{1,3})?$"
                        className="text-slate-700"
                        value={average}
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
      ) : null}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top 5 Tracks */}
        <div className="flex flex-col p-8">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl mb-2">
              Tracks for Recommendations
            </h2>
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
                      <span className="text-lg font-bold">{track.name}</span>
                      <span className="text-sm text-grey">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>
              Select 5 tracks to be used for you recommendations from the list
              below
            </div>
          )}
        </div>
        {/* Top 5 Genres */}
        <div className="flex flex-col p-8">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl mb-2">
              Genres for Recommendations
            </h2>
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
              Select 5 genres to be used for you recommendations from the list
              below
            </div>
          )}
        </div>
        {/* Top 5 Artists */}
        <div className="flex flex-col p-8">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl mb-2">
              Artists for Recommendations
            </h2>
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
                      <span className="text-lg font-bold">{artist.name}</span>
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
              Select 5 artists to be used for you recommendations from the list
              below
            </div>
          )}
        </div>
        {/* Genres */}
        <div className="flex flex-col p-8">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl mb-2">Genres</h2>
          </div>
          {genres.length ? (
            <ul className="flex flex-col gap-4">
              {genres.map((tuple) => {
                const [genre] = tuple;

                // Return a title
                return (
                  <li
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
                          setGenresForFeatures([...genresForFeatures, tuple]);
                        }}
                      >
                        <Icons.add size={15} />
                      </Button>
                    ) : (
                      <Button size={"xs"} variant={"secondary"} disabled>
                        <Icons.frown size={15} />
                      </Button>
                    )}
                    <div className="flex flex-col">
                      <span className="text-lg font-bold">{genre}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>Select some genres to use for your recommendations below</div>
          )}
        </div>
        {/* Top Tracks */}
        {topTracks.length ? (
          <div className="flex flex-col p-8">
            <div className="flex gap-4">
              <h2 className="font-bold text-2xl mb-2">Top Tracks</h2>
            </div>
            <ul className="flex flex-col gap-4">
              {topTracks.map((track) => (
                <li
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
                    <Button size={"xs"} variant={"secondary"} disabled>
                      <Icons.frown size={15} />
                    </Button>
                  )}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">{track.name}</span>
                    <span className="text-sm text-grey">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {/* Top Artists */}
        {topArtists.length ? (
          <div className="flex flex-col p-8">
            <div className="flex gap-4">
              <h2 className="font-bold text-2xl mb-2">Top Artists</h2>
            </div>
            <ul className="flex flex-col gap-4">
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
                    <Button size={"xs"} variant={"secondary"} disabled>
                      <Icons.frown size={15} />
                    </Button>
                  )}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">{artist.name}</span>
                    <span className="text-sm text-grey capitalize">
                      {artist.genres.join(", ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
