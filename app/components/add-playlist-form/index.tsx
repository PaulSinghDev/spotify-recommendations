import { Form } from "@remix-run/react";
import { useState } from "react";
import { SpotifyTrackType } from "~/types/spotify";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

export function AddPlaylistForm({
  recommendations,
  setIsLoading,
  setPlaylistCreated,
  setPlaylistUrl,
  setPlaylistError,
}: {
  recommendations: SpotifyTrackType[];
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaylistCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaylistUrl: React.Dispatch<React.SetStateAction<string>>;
  setPlaylistError: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [isPrivatePlaylist, setIsPrivatePlaylist] = useState(true);

  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={async () => {
        setIsLoading(true);
        const ids = recommendations.map((track) => track.uri).join(",");
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
