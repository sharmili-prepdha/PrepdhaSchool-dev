import { Topic } from "@/app/generated/prisma/client";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { ImageIcon, PlusCircleIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Field, FieldLabel } from "../ui/field";

export const TopicCard = ({
  topic,
  isSelected,
  progress,
  onClick,
}: {
  topic: Topic;
  isSelected: boolean;
  progress: number;
  onClick: () => void;
}) => {
  return (
    <Card
      className={cn(
        "w-30 h-32 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 flex flex-col",
        isSelected ? "border-primary/50 bg-muted/30" : "",
      )}
      onClick={onClick}
    >
      <CardHeader className="p-2 shrink-0">
        <ImageIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 overflow-hidden min-h-0 flex-1 flex items-center justify-center">
        <p className="text-sm font-medium line-clamp-2 text-ellipsis w-full min-w-0 ">
          {topic.title}
        </p>
      </CardContent>
      <CardFooter className="p-2 shrink-0">
        {progress > 0 ? (
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="progress-upload">
              <span className="ml-auto">{progress}%</span>
            </FieldLabel>
            <Progress className="bg-green-400" value={progress} id="progress-upload" />
          </Field>
        ) : (
          <Badge variant="outline">Not Started</Badge>
        )}
      </CardFooter>
    </Card>
  );
};
export const AddTopicCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <Card
      className="w-30 h-32 cursor-pointer flex flex-col items-center justify-center border-grey-300 transition-colors hover:border-primary/50 hover:bg-muted/30 text-center"
      onClick={onClick}
    >
      <CardContent className="text-sm font-medium p-3 text-center items-center justify-center flex flex-row gap-2 ">
        <PlusCircleIcon className="size-4 text-muted-foreground" />
        <h1 className="text-sm font-medium text-muted-foreground">Add Topic</h1>
      </CardContent>
    </Card>
  );
};
