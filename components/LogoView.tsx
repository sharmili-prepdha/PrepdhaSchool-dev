"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

export default function LogoView({ logoUrl }: { logoUrl: string }) {
  const [showLogo, setShowLogo] = useState(false);

  return (
    <Dialog open={showLogo} onOpenChange={setShowLogo}>
      <DialogTrigger asChild>
        <div className="cursor-pointer group relative w-fit">
          <Image
            src={logoUrl}
            alt="School Logo"
            width={60}
            height={60}
            className="rounded-xl border shadow-sm object-cover transition-all duration-200 group-hover:opacity-90 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl border-none bg-transparent shadow-none p-0 flex items-center justify-center">
        <DialogTitle className="sr-only">School Logo View</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={logoUrl}
            alt="Full Logo"
            width={800}
            height={800}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white/10 h-auto w-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
