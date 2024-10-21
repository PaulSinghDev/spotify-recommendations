import { Job } from "@prisma/client";
import { prisma } from "../prisma/client";

export const updateJob = async (id: string, data: Partial<Job>) => {
  const job = await prisma?.job.update({
    where: {
      id,
    },
    data: {
      ...data,
      data: data.data ? data.data : undefined,
    },
  });

  return job;
};
