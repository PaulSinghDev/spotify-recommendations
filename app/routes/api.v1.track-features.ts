import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { getTrackFeatures } from "~/lib/spotify/getTrackFeatures";
import { batchArray } from "~/lib/utils";
import { spotifyStrategy } from "~/services/auth.server";
import { SpotifyTrackFeaturesType } from "~/types/spotify";

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

  // We need to pass track IDs to the spotify route
  const trackIds = new URL(request.url).searchParams.get("ids")?.split(",");
  if (!trackIds?.length) {
    // No IDs
    return json({ success: false }, 402);
  }

  // Batch our array as the limit is 50 on the Spotify API
  const batches = batchArray<string>(trackIds);

  // Init an output array
  const output: SpotifyTrackFeaturesType[] = [];

  // iterate our batches
  for (const batch of batches) {
    // Get the response
    const data = await getTrackFeatures(session.accessToken, batch);

    // push to output
    output.push(...data.audio_features);
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
