"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Copy,
  Eraser,
  Highlighter,
  Loader2,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type HighlightToolbarProps = {
  toolbarRect: DOMRect;
  selectedText: string;
  onHighlight: () => void;
  onUnhighlight?: () => void;
  canUnhighlight?: boolean;
  isSaving: boolean;
  saveError: string | null;
  pageId: number;
};

type ToolbarButtonItem = {
  type: "button";
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "default";
};

type ToolbarDropdownItem = {
  type: "dropdown";
  icon: ReactNode;
  label: string;
  content: ReactNode;
  variant?: "primary" | "default";
};

type ToolbarItem = ToolbarButtonItem | ToolbarDropdownItem;

function ToolbarDivider() {
  return <div aria-hidden className="h-5 w-px shrink-0 bg-border" role="separator" />;
}

function ToolbarButtonList({ items }: { items: ToolbarItem[] }) {
  const buttonClass = (variant: "primary" | "default" = "default") =>
    variant === "primary"
      ? "flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
      : "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50";

  return (
    <>
      {items.map((item, index) => (
        <span key={index} className="contents">
          {index > 0 && <ToolbarDivider />}
          {item.type === "button" ? (
            <button
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={buttonClass(item.variant)}
            >
              {item.loading ? <Loader2 className="size-4 animate-spin" /> : item.icon}
              {item.loading && (item.label === "Highlight" || item.label === "Unhighlight")
                ? "Saving…"
                : item.label}
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={buttonClass(item.variant)}>
                  {item.icon}
                  {item.label}
                  <ChevronDown className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                {item.content}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </span>
      ))}
    </>
  );
}

export function HighlightToolbar({
  toolbarRect,
  selectedText,
  onHighlight,
  onUnhighlight,
  canUnhighlight = false,
  isSaving,
  saveError,
  pageId,
}: HighlightToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!selectedText) return;
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [selectedText]);

  const toolbarItems: ToolbarItem[] = [
    {
      type: "dropdown",
      icon: <Plus className="size-4" />,
      label: "Add it to",
      variant: "primary",
      content: (
        <>
          <DropdownMenuItem>Notes</DropdownMenuItem>
          <DropdownMenuItem>Flashcards</DropdownMenuItem>
          <DropdownMenuItem>Study set</DropdownMenuItem>
        </>
      ),
    },
    {
      type: "button",
      icon: <Sparkles className="size-4" />,
      label: "Ask AI",
    },
    {
      type: "button",
      icon: <MessageSquare className="size-4" />,
      label: "Add a Comment",
    },
    ...(canUnhighlight && onUnhighlight
      ? [
          {
            type: "button" as const,
            icon: <Eraser className="size-4" />,
            label: "Unhighlight",
            onClick: onUnhighlight,
            disabled: isSaving,
            loading: isSaving,
          },
        ]
      : [
          {
            type: "button" as const,
            icon: <Highlighter className="size-4" />,
            label: "Highlight",
            onClick: onHighlight,
            disabled: isSaving,
            loading: isSaving,
          },
        ]),
    {
      type: "button",
      icon: <Copy className="size-4" />,
      label: copied ? "Copied!" : "Copy Text",
      onClick: handleCopy,
    },
  ];

  const toolbarCenterX = toolbarRect.left + toolbarRect.width / 2;

  return (
    <div
      className="fixed z-50 flex flex-col gap-2 animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: toolbarCenterX,
        top: toolbarRect.top,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex items-center gap-0 rounded-full border border-border bg-popover px-1 py-1 shadow-lg">
        <ToolbarButtonList items={toolbarItems} />
      </div>

      {saveError && (
        <div className="rounded-lg border border-border bg-popover px-2.5 py-2 shadow-lg">
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="flex flex-col gap-1.5 text-xs">
              {saveError === "Unauthorized" ? "Sign in to save highlights" : saveError}
              {saveError === "Unauthorized" && (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/pageview?id=${pageId}`)}`}
                  className="font-medium text-primary underline underline-offset-2 hover:opacity-90"
                >
                  Sign in
                </Link>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
