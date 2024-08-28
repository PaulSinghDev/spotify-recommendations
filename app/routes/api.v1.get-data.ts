import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/prisma/client";
import { spotifyStrategy } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await spotifyStrategy.getSession(request);

  if (!session?.user?.id) return json({ error: "Unauthorized" }, 401);

  switch (request.method) {
    case "POST": {
      const data = await request.json();

      if (data.type === "tracks") {
        const tracks = await prisma?.track.findMany({
          where: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
          include: {
            features: true,
          },
        });

        return json({ data: tracks });
      }

      if (data.type === "artists") {
        const artists = await prisma?.artist.findMany({
          where: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        });

        return json({ data: artists });
      }
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
