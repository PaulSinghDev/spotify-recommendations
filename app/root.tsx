import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { Nav } from "./components/nav";
import { Footer } from "./components/footer";
import { TooltipProvider } from "./components/ui/tooltip";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col bg-gradient-to-b from-green-700 from-1% via-10% to-60% via-green-900 to-zinc-950 min-h-screen max-w-full">
        <Nav />
        <TooltipProvider>{children}</TooltipProvider>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
