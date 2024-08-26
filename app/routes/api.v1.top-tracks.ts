import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { addArtistsToDb } from "~/lib/spotify/addArtistsToDb";
import { addTracksToDb } from "~/lib/spotify/addTracksToDb";
import { getTopTracks } from "~/lib/spotify/getTopTracks";
import { spotifyStrategy } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the user session
  const session = await spotifyStrategy.getSession(request);

  // No session, not authenticated
  if (
    !session?.accessToken ||
    !session.user ||
    new Date(session.expiresAt) <= new Date()
  ) {
    return json({ success: false }, 401);
  }

  // Authenticated, try get tracks
  const tracks = await getTopTracks(session.accessToken);

  // Ge all artistIds
  const artistIds = tracks.items
    .map((track) => track.artists.map((artist) => artist.id))
    .flat();

  // Add our artists to the DB
  await addArtistsToDb(session.accessToken, session.user.id, artistIds);

  // Now we know all artists are in our DB we can continue with adding them to
  // our tracks
  await addTracksToDb(tracks.items, session.user.id, session.accessToken);

  // Return the tracks
  return json({ success: true, data: tracks.items }, 200);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      /* handle "POST" */
      break;
    }
    case "PUT": {
      /* handle "PUT" */
      break;
    }
    case "PATCH": {
      /* handle "PATCH" */
      break;
    }
    case "DELETE": {
      /* handle "DELETE" */
      break;
    }
    default: {
      break;
    }
  }
};
