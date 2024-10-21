import { JobStatus } from "@prisma/client";
import { prisma } from "../prisma/client";

export const getJobs = async (
  ids?: string[],
  status?: JobStatus[],
  user?: string
) => {
  const jobs = await prisma?.job.findMany({
    where: {
      id: {
        in: ids,
      },
      status: {
        in: status ? status : undefined,
      },
      creatorId: user,
    },
  });

  return jobs;
};
