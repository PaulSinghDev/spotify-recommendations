import { prisma } from "./client";

export const getTracks = async (trackIds: string[], userId?: string) => {
  const data = await prisma?.track.findMany({
    where: {
      id: { in: trackIds },
      ...(userId && { users: { some: { id: userId } } }),
    },
  });

  return data;
};
