import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Icons } from "~/components/ui/icons";

const linkVariants = cva(
  "font-inherit text-md text-foreground transition-colors cursor-pointer underline-offset-2 text-decoration-color-foreground decoration-2 hover:underline ",
  {
    variants: {
      variant: {
        default: "",
        secondary:
          "text-secondary-foreground text-decoration-color-secondary-foreground",
        button: "bg-foreground text-background py-2 px-4 rounded-full",
      },
      size: {
        default: "text-md",
        xs: "text-xs font-light",
        sm: "text-sm",
        lg: "text-lg",
        xl: "text-xl py-4 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type AnchorLinkPropsType = {
  href: string;
  title: string;
  label?: string;
  children?: React.ReactNode;
  target?: "_blank" | "_parent" | "_self" | "_top";
} & React.HTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof linkVariants>;

type AnchorLinkWithLabelPropsType = {
  label: string;
  children?: never;
} & AnchorLinkPropsType;

type AnchorLinkWithChildrenPropsType = {
  label?: never;
  children: React.ReactNode;
} & AnchorLinkPropsType;

export function AnchorLink({
  className,
  href,
  title,
  label,
  children,
  variant,
  size,
  ...props
}: AnchorLinkWithLabelPropsType | AnchorLinkWithChildrenPropsType) {
  const isEmail = /^mailto:/.test(href);
  const isTikTok = /tiktok\.com/.test(href);
  const isInstagram = /instagram\.com/.test(href);

  return (
    <a
      href={href}
      title={title}
      className={cn(
        linkVariants({ variant, size }),
        `${
          isEmail || isTikTok || isInstagram
            ? "inline-flex gap-2 items-center "
            : ""
        }${className}`
      )}
      rel={isInstagram || isTikTok ? "noopener noreferrer" : ""}
      target={isInstagram || isTikTok ? "_blank" : ""}
      {...props}
    >
      {isEmail ? (
        <Icons.mail size={15} className="max-w-[15px] max-h-[15px]" />
      ) : null}
      {isTikTok ? (
        <Icons.tikTok size={15} className="max-w-[15px] max-h-[15px]" />
      ) : null}
      {isInstagram ? (
        <Icons.instagram size={15} className="max-w-[15px] max-h-[15px]" />
      ) : null}
      {children ? children : label}
    </a>
  );
}
