import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { getRecentlyPlayed } from "~/lib/spotify/getRecentlyPlayed";
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
  const tracks = await getRecentlyPlayed(session.accessToken);

  return json(
    { success: true, data: tracks.items.map(({ track }) => track) },
    200
  );
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
