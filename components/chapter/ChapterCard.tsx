import * as React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const ChapterCard = ({
  title,
  hasSelectedTopic,
  ...rest
}: { title: string; hasSelectedTopic: boolean } & React.ComponentPropsWithoutRef<typeof Button>) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto w-full justify-between gap-2 rounded-xl border-2 py-2.5 pl-3 pr-2.5 text-left font-normal cursor-pointer",
        hasSelectedTopic
          ? "border-primary bg-primary/10 text-primary"
          : "border-grey-300 bg-grey-50 text-grey-900 hover:bg-secondary/20",
      )}
      {...rest}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </Button>
  );
};

export default ChapterCard;
