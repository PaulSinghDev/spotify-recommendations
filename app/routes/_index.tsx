// app/routes/_index.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { InfoCard } from "~/components/info-card";
import { AnchorLink } from "~/components/ui/anchor-link";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma/client";
import { spotifyStrategy } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // get a spotify session which is authenticated
  const session = await spotifyStrategy.getSession(request);

  // Get some playlists
  const playlists = await prisma?.playlist.findMany({ take: 5 });

  // No session, fucked up
  if (!session) return { playlists, session: null };

  return {
    session,
    playlists,
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const user = data?.session?.user;

  return (
    <div>
      <div className="max-w-[1200px] mx-auto">
        <header className="px-8 pt-32 flex flex-col items-center mb-24">
          <div className="max-w-[600px] w-full mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-pretty mb-4 text-center">
              Spotify Playlist Creator
            </h1>
            <p className="font-thin text-center text-xl">
              Use your recent listening history to generate new playlists
              tailored to your current taste
            </p>
            <div className="mt-8 flex gap-4 flex-col md:flex-row items-center justify-center">
              {!user ? (
                <Form
                  action={user ? "/logout" : "/auth/spotify"}
                  method="post"
                  className="text-center grow flex max-w-full w-[250px] justify-center"
                >
                  <Button
                    variant={user ? "destructive" : "positive"}
                    className="flex w-full grow max-w-[250px]"
                  >
                    Login
                  </Button>
                </Form>
              ) : (
                <AnchorLink
                  href="/create"
                  title="Go to playlist creator"
                  className="bg-primary text-secondary py-2 px-4 rounded-full hover:bg-opacity-80 transition-opacity min-w-[150px] text-center"
                >
                  Get Started
                </AnchorLink>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-4 items-center justify-center max-w-content px-8">
          <h2 className="text-xl mb-4 text-gray-300">Recently Created</h2>
          {data?.playlists?.map((list) => (
            <InfoCard
              title={list.name}
              created={new Date(list.created)}
              image={{
                src: list.cover,
              }}
              key={`playlist-${list.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
