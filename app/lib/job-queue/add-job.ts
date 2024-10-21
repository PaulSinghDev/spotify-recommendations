import { JobStatus, JobType } from "@prisma/client";
import { prisma } from "../prisma/client";
import { InputJsonObject } from "@prisma/client/runtime/library";

export const addJob = async (
  jobType: JobType,
  userId: string,
  data?: InputJsonObject
) => {
  console.log("Adding job", jobType);
  const job = await prisma?.job.create({
    data: {
      status: JobStatus.PENDING,
      creatorId: userId,
      type: jobType,
      progress: 0,
      data,
    },
  });

  return job;
};
