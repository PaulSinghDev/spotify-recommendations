import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { getArtistsFromIds } from "~/lib/spotify/getArtistsFromIds";
import { batchArray } from "~/lib/utils";
import { spotifyStrategy } from "~/services/auth.server";
import { SpotifyFullArtistType } from "~/types/spotify";

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
  const artistIds = new URL(request.url).searchParams.get("ids")?.split(",");
  if (!artistIds?.length) {
    // No IDs
    return json({ success: false }, 402);
  }

  // batch them
  const batches = batchArray<string>(artistIds);

  // init output
  const output: SpotifyFullArtistType[] = [];

  // iterate artists
  for (const batch of batches) {
    // Authenticated, try get artists
    const artists = await getArtistsFromIds(session.accessToken, batch);

    // Push it
    output.push(...artists);
  }

  return json({ success: true, data: output }, 200);
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
