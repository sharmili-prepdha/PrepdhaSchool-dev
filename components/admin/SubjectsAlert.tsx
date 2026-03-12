import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";

export function SubjectsAlert({ message, state }: { message: string; state?: boolean }) {
  return (
    <Alert
      className="max-w-md transition-opacity ease-in-out duration-300"
      variant={state ? "default" : "destructive"}
    >
      <CheckCircle2Icon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
