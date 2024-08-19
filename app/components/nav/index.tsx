import { useScreenSize } from "~/hooks/useScreenSize";
import { AnchorLink } from "../ui/anchor-link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Icons } from "../ui/icons";
import { cn } from "~/lib/utils";

const navLinks: { href: string; title: string; label: string }[] = [
  {
    href: "/",
    title: "Go to home page",
    label: "Home",
  },
  {
    href: "/create",
    title: "Create a playlist",
    label: "Create",
  },
];

function NavLinks({ isDesktop }: { isDesktop?: boolean }) {
  return (
    <div className={cn("flex  gap-2", isDesktop ? "flex-row" : "flex-col")}>
      {navLinks.map((link) => (
        <AnchorLink
          href={link.href}
          title={link.title}
          key={`nav-link-${link.href}`}
          className="font-light"
        >
          {link.label}
        </AnchorLink>
      ))}
    </div>
  );
}

function MobileNavDrawer() {
  return (
    <Sheet>
      <SheetTrigger>
        <Icons.menu />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Some words</SheetDescription>
        </SheetHeader>
        <NavLinks />
      </SheetContent>
    </Sheet>
  );
}

export function Nav() {
  const { width } = useScreenSize();

  return (
    <aside className="fixed top-0 left-0 w-full">
      <nav className="flex justify-end gap-4 py-4 px-8 max-w-[1200px] mx-auto">
        {width && width >= 755 ? <NavLinks isDesktop /> : <MobileNavDrawer />}
      </nav>
    </aside>
  );
}
