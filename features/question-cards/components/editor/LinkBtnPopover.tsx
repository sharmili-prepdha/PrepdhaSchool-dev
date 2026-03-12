"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Link as LinkIcon, Check, X, ExternalLink } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LinkBtnPopoverProps {
  editor: Editor;
}

export function LinkBtnPopover({ editor }: LinkBtnPopoverProps) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Pre-fill if a link is already active
      const existingUrl = editor.getAttributes("link").href ?? "";
      setUrlInput(existingUrl);
    }
    setOpen(isOpen);
  };

  const insertLink = () => {
    if (!urlInput.trim()) return;

    // Auto-prepend https:// if missing
    const href = urlInput.startsWith("http://") || urlInput.startsWith("https://")
      ? urlInput.trim()
      : `https://${urlInput.trim()}`;

    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setUrlInput("");
    setOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrlInput("");
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setUrlInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") insertLink();
    if (e.key === "Escape") handleCancel();
  };

  const isLinkActive = editor.isActive("link");

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Toggle 
        // size="sm"
         pressed={isLinkActive || open} aria-label="Insert link">
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {isLinkActive ? "Edit Link" : "Insert Link"}
          </p>
          <div className="flex gap-2 items-center">
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 justify-between pt-1">
            {/* Remove link — only show if link is active */}
            {isLinkActive && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeLink}
              >
                Remove Link
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={insertLink}
                disabled={!urlInput.trim()}
              >
                <Check className="h-3 w-3 mr-1" />
                {isLinkActive ? "Update" : "Insert"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}