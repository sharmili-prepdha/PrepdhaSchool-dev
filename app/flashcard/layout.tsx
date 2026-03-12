import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Only */}
      <header className="h-12 border-b flex items-center px-6">
        <Button variant="elevated" className="mr-4 border-b-2 border-gray-400"><X /></Button>
        <h1 className="text-lg font-semibold">Review Session</h1>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex justify-center">
        {children}
      </main>
    </div>
  );
}