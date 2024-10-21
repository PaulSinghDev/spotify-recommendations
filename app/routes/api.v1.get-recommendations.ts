import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { addArtistsToDb } from "~/lib/spotify/addArtistsToDb";
import { addTracksToDb } from "~/lib/spotify/addTracksToDb";
import { fetchRecommendations } from "~/lib/spotify/fetchRecommendations";
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

  // We need to pass artist IDs to the spotify route
  const params = new URL(request.url).searchParams;

  const data = await fetchRecommendations(params, session.accessToken);

  // Get the artist IDs from the new tracks
  const artistIds = data
    .map((track) => track.artists.map((artist) => artist.id))
    .flat();

  // Add the new artists to the DB
  await addArtistsToDb(session.accessToken, session.user.id, artistIds);

  // add the recommendations to the db
  await addTracksToDb(data, session.user.id, session.accessToken);

  return json({ success: true, data }, 200);
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
