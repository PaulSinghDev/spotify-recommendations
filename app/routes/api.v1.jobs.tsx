import { JobType } from "@prisma/client";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { addJob } from "~/lib/job-queue/add-job";
import { getJobs } from "~/lib/job-queue/get-jobs";
import { createPlaylist } from "~/lib/spotify/create-playlist";
import { getData } from "~/lib/spotify/get-data";
import { getRecommendations } from "~/lib/spotify/get-recommendations";
import { spotifyStrategy } from "~/services/auth.server";
import {
  CreatePlaylistData,
  GetRecommendationsData,
  isCreatePlaylistData,
  isGetRecommendationsData,
} from "~/types/data";
import { isJobStatus } from "~/types/spotify";

export type JobRequest = {
  type: JobType;
  data?: GetRecommendationsData | CreatePlaylistData;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the user session
  const session = await spotifyStrategy.getSession(request);

  // No session, not authenticated
  if (
    !session?.accessToken ||
    !session.user ||
    !session.user.id ||
    new Date(session.expiresAt) <= new Date()
  ) {
    return json({ success: false }, 401);
  }

  const params = new URLSearchParams(request.url.split("?")[1]);

  const id = params.get("id");
  const status = params.get("status");
  const user = params.get("user");

  const jobs = await getJobs(
    id ? [id] : undefined,
    status ? status.split(",").filter(isJobStatus) : undefined,
    user ? user : undefined
  );

  return json({ success: true, data: jobs }, 200);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Get the user session
  const session = await spotifyStrategy.getSession(request);

  // No session, not authenticated
  if (
    !session?.accessToken ||
    !session.user ||
    !session.user.id ||
    new Date(session.expiresAt) <= new Date()
  ) {
    return json({ success: false }, 401);
  }

  switch (request.method) {
    case "POST": {
      /* handle "POST" */
      const body: JobRequest = await request.json();

      const job = await addJob(body.type, session.user.id, body.data);

      if (job?.type === "GET_DATA") {
        console.log("Getting data");

        getData(job.id, session.accessToken, session.user.id);
      }

      if (
        job?.type === "CREATE_PLAYLIST" &&
        body.data &&
        isCreatePlaylistData(body.data)
      ) {
        createPlaylist(job.id, session.accessToken, session.user.id, body.data);
      }

      if (
        job?.type === "GET_RECOMMENDATIONS" &&
        body.data &&
        isGetRecommendationsData(body.data)
      ) {
        console.log("Getting recommendations");

        getRecommendations(
          job.id,
          session.accessToken,
          session.user.id,
          body.data
        );
      }

      return json({ success: true, data: job }, 200);
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
