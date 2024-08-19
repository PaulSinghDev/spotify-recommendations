import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

export function InfoCard({
  image,
  title,
  created,
  description,
}: {
  image?: { src: string; alt?: string };
  title: string;
  created?: Date;
  description?: string;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <div className="max-w-[400px] overflow-hidden w-full border p-4 rounded-2xl bg-slate-800 bg-opacity-90 border-slate-700 shadow-lg flex gap-4 items-center">
      <div className="w-[50px] h-[50px] bg-slate-400 rounded-full self-center grow-0 shrink-0">
        {image ? (
          <img
            src={image.src}
            alt={image.alt || `Artwork for ${title}`}
            width={50}
            height={50}
            className="w-full h-full object-cover rounded-full"
          />
        ) : null}
      </div>
      <div className="flex flex-col mb-2">
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild onClick={() => setTooltipOpen(true)}>
            <h3 className="font-bold text-left text-ellipsis line-clamp-1 max-w-full">
              {title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>
        {created ? (
          <span className="font-light text-sm text-zinc-400">
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
              created
            )}
          </span>
        ) : null}
        {description ? (
          <span className="font-light line-clamp-1 text-sm text-zinc-400">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
