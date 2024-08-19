import { AnchorLink } from "../ui/anchor-link";

export function Footer() {
  return (
    <footer className="px-8 pt-32 pb-10 text-center font-thin text-gray-300 mt-auto text-xs">
      Made for fun by{" "}
      <AnchorLink
        href="https://paulsingh.dev"
        title="Go to Paul's website"
        target="_blank"
        rel="noopener noreferrer"
      >
        Paul Singh
      </AnchorLink>
    </footer>
  );
}
