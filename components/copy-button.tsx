import { CopyIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useState } from "react";

export function CopyableText({
  content,
  children,
  ...rest
}: React.ComponentProps<"button"> & { content: string }) {
  const [tooltip, setTooltip] = useState("Copy to clipboard");
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={(value) => setOpen(value)}>
        <TooltipTrigger asChild>
          <div className="flex items-center w-[50ch]">
            {children}
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                window.navigator.clipboard.writeText(content);
                setTooltip("Successfully copied!");
                setOpen(true);
                setTimeout(() => {
                  setOpen(false);
                  setTimeout(() => {
                    setTooltip("Copy to clipboard");
                  }, 100);
                }, 500);
              }}
              className="ml-4 text-xs"
              {...rest}
            >
              <CopyIcon className="size-2 hover:scale-105 transition-all" />
              <span className="text-xs px-0.5 py-0">Copy</span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className={open ? "block" : "hidden"}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
