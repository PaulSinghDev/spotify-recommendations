import { json, LoaderFunctionArgs } from "@remix-run/node";
import { spotifyStrategy } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await spotifyStrategy.getSession(request);

  // No session, not authenticated
  if (
    !session?.accessToken ||
    !session.user ||
    new Date(session.expiresAt) <= new Date()
  ) {
    return json({ success: false }, 401);
  }

  const params = new URL(request.url).searchParams;

  const playlistName = params.get("name");
  const isPrivatePlaylist = params.get("isPrivate")?.toUpperCase() === "TRUE";
  const trackUris = params.get("tracks");

  const createPlaylistRequestUrl = `https://api.spotify.com/v1/users/${session.user.id}/playlists`;

  // Make the create playlist request
  const createPlaylistRequest = await fetch(createPlaylistRequestUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      name: playlistName,
      description: "Created by Spotify recommendations",
      public: !isPrivatePlaylist,
    }),
  });

  // Get the response
  const createPlaylistResponse = await createPlaylistRequest.json();

  // do we have an ID for the playlist?
  if (!createPlaylistResponse.id) {
    throw new Error("Failed to create playlist");
  }

  // add songs to the playlist
  const updatePlaylistRequest = await fetch(
    `https://api.spotify.com/v1/playlists/${createPlaylistResponse.id}/tracks?uris=${trackUris}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  // get the response
  const res = await updatePlaylistRequest.json();

  return json({ success: true, data: [res] }, 200);
};
