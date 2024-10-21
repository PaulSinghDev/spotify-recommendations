import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getTracks } from "~/lib/prisma/tracks";
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

  const params = new URL(request.url).searchParams;

  const trackIds = params.get("ids");

  if (!trackIds) {
    return json({ success: false }, 400);
  }

  const data = await getTracks(trackIds.split(","), session.user.id);

  return json({ success: true, data }, 200);
};
