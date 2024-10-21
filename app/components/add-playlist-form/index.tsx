import { Form } from "@remix-run/react";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Job, Track } from "@prisma/client";
import { GenericAPIResponse } from "~/types/data";
import { JobRequest } from "~/routes/api.v1.jobs";

export function AddPlaylistForm({
  recommendations,
  setPlaylistCreated,
  setPlaylistUrl,
  setPlaylistError,
  setCreatePlaylistJob,
}: {
  recommendations: Track[];
  setPlaylistCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaylistUrl: React.Dispatch<React.SetStateAction<string>>;
  setPlaylistError: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatePlaylistJob: React.Dispatch<React.SetStateAction<Job | null>>;
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [isPrivatePlaylist, setIsPrivatePlaylist] = useState(true);

  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const body: JobRequest = {
          type: "CREATE_PLAYLIST",
          data: {
            playlistName: playlistName,
            isPrivatePlaylist: isPrivatePlaylist,
            trackUris: recommendations.map((track) => track.spotifyUri),
          },
        };

        const request = await fetch("/api/v1/jobs", {
          method: "POST",
          body: JSON.stringify(body),
        });

        const response: GenericAPIResponse<Job> = await request.json();

        const jobId = response.data.id;

        if (!jobId) {
          throw new Error("No job id returned");
        } else {
          // Store the job in state
          setCreatePlaylistJob(response.data);

          // Check the job status
          const timer = setInterval(async () => {
            const request = await fetch(`/api/v1/jobs?id=${jobId}`);

            const response: GenericAPIResponse<Job[]> = await request.json();

            const updatedJob = response?.data?.find((j: Job) => j.id === jobId);

            if (updatedJob && updatedJob.status !== "COMPLETED") {
              setCreatePlaylistJob(updatedJob);
            } else if (
              updatedJob &&
              updatedJob.data instanceof Object &&
              "playlistUrl" in updatedJob.data &&
              typeof updatedJob.data.playlistUrl === "string" &&
              updatedJob.status === "COMPLETED"
            ) {
              setCreatePlaylistJob(null);
              setPlaylistCreated(true);
              setPlaylistUrl(updatedJob.data.playlistUrl);
              clearInterval(timer);
            } else {
              setCreatePlaylistJob(null);
              setPlaylistError(true);
              clearInterval(timer);
            }
          }, 5000);
        }
        /*
        setIsLoading(true);
        const ids = recommendations.map((track) => track.spotifyUri).join(",");
        const urlParams = new URLSearchParams(
          `tracks=${ids}&name=${playlistName}&isPrivate=${isPrivatePlaylist}`
        );

        const request = await fetch(
          `/api/v1/create-playlist?${urlParams.toString()}`
        );
        const response = await request.json();

        if (response?.data?.[0]?.createResponse?.uri) {
          setPlaylistUrl(response?.data?.[0]?.createResponse?.uri);
          setPlaylistCreated(true);
        } else {
          setPlaylistError(true);
        }
        setIsLoading(false);
        */
      }}
    >
      <div>
        <Label>Playlist Name</Label>
        <Input
          required
          type="text"
          name="name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.currentTarget.value)}
        />
      </div>
      <div className="flex gap-4 items-center">
        <Switch
          checked={isPrivatePlaylist}
          onCheckedChange={setIsPrivatePlaylist}
        />
        <Label>Is the playlist private?</Label>
      </div>
      <Button>Create Playlist</Button>
    </Form>
  );
}
