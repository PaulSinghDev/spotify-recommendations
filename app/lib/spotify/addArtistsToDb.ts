import { prisma } from "../prisma/client";
import { getArtistsFromIds } from "./getArtistsFromIds";

export const addArtistsToDb = async (
  accessToken: string,
  userId: string,
  artistIds: string[]
) => {
  // Iterate artist IDs and create an artist in our DB if they are not there
  for (const artistId of artistIds) {
    // Get the artist from the DB
    const artist = await prisma?.artist.findUnique({
      where: {
        id: artistId,
      },
      select: {
        id: true,
      },
    });

    // No artist in DB, create it
    if (!artist) {
      // Get the full artist object as we only get partial with the tracks request
      const [artist] = await getArtistsFromIds(accessToken, [artistId]);

      // Create the artist in the DB if we have one
      if (artist) {
        await prisma?.artist.create({
          data: {
            id: artist.id,
            name: artist.name,
            genres: artist.genres,
            created: new Date(),
            image: artist.images[0]?.url,
            users: {
              connect: {
                id: userId,
              },
            },
          },
        });
      }
    }
  }
};
