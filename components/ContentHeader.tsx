"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  LogOut,
  Moon,
  RefreshCw,
  Search,
  Star,
  Sun,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ContentHeaderProps = {
  /** User total XP (shown in primary header) */
  xp?: number;
  /** Progress percentage 0–100 (shown as circular badge on web) */
  progressPercent?: number;
  /** Content XP for current section (blue pill in secondary header) */
  contentXp?: number;
  /** Breadcrumb path segments, e.g. ["History", "Social Studies", "Military Campaigns"] */
  breadcrumbs?: string[];
  /** Main content title */
  title?: string;
  /** Whether content needs attention (shows yellow tag) */
  needsAttention?: boolean;
  /** Progress value 0–100 for the green progress bar */
  progressValue?: number;
  /** Whether title is favorited (star filled vs outline) */
  isFavorite?: boolean;
  /** Callback when back arrow is clicked */
  onBack?: () => void;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Callback when favorite star is toggled */
  onFavoriteToggle?: () => void;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** User initials for avatar fallback */
  userInitials?: string;
  /** Optional custom logo href */
  logoHref?: string;
  /** Optional additional class for the root */
  className?: string;
};

/* -------------------------------------------------------------------------- */
/* Prepdha Logo                                                               */
/* -------------------------------------------------------------------------- */

function PrepdhaLogo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 text-foreground no-underline hover:opacity-90 transition-opacity",
        className,
      )}
      aria-label="Prepdha Home"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white"
        aria-hidden
      >
        <Check className="size-4 stroke-2" />
      </span>
      <span className="font-semibold text-base hidden sm:inline">Prepdha</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Search Bar (Web)                                                           */
/* -------------------------------------------------------------------------- */

function SearchBar({
  onSearch,
  placeholder = "Search for keywords, topic, chapter, anything.",
}: {
  onSearch?: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 max-w-xl mx-auto hidden md:flex border-grey-900"
    >
      <div className="relative w-full">
        <Search className=" pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-muted/60 border-grey-900 rounded-full h-9"
          aria-label="Search"
        />
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Search Sheet                                                        */
/* -------------------------------------------------------------------------- */

function MobileSearchSheet({
  onSearch,
  placeholder = "Search for keywords, topic, chapter, anything.",
}: {
  onSearch?: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open search">
          <Search className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="rounded-t-2xl" showCloseButton={true}>
        <SheetHeader>
          <SheetTitle className="sr-only">Search</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 px-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/60 rounded-full h-10"
              autoFocus
              aria-label="Search"
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/* User Avatar Menu Items                                                     */
/* -------------------------------------------------------------------------- */

function UserAvatarMenuItems() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      <DropdownMenuItem onClick={toggleTheme}>
        {isDark ? (
          <>
            <Sun className="size-4" />
            Light mode
          </>
        ) : (
          <>
            <Moon className="size-4" />
            Dark mode
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/logout">
          <LogOut className="size-4" />
          Logout
        </Link>
      </DropdownMenuItem>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ContentHeader({
  xp = 0,
  progressPercent,
  contentXp,
  breadcrumbs = [],
  title,
  needsAttention = false,
  progressValue,
  isFavorite = false,
  onBack,
  onSearch,
  onFavoriteToggle,
  onRefresh,
  userInitials = "U",
  logoHref = "/",
  className,
}: ContentHeaderProps) {
  const hasSecondaryContent =
    title != null ||
    breadcrumbs.length > 0 ||
    needsAttention ||
    progressValue != null ||
    contentXp != null ||
    onBack != null;

  return (
    <header
      className={cn("sticky top-0 z-40 bg-background border-b border-grey-300", className)}
      data-testid="content-header"
    >
      {/* Primary header bar */}
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <PrepdhaLogo href={logoHref} />

        <SearchBar onSearch={onSearch} />
        <MobileSearchSheet onSearch={onSearch} />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* XP - hidden on mobile, shown on md+ */}
          {xp > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              <Zap className="size-4 text-amber-500" />
              <span className="font-medium">{xp.toLocaleString()} XP</span>
            </div>
          )}

          {/* Progress % - web only */}
          {progressPercent != null && (
            <div
              className="hidden sm:flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
              title={`${progressPercent}% progress`}
            >
              {progressPercent}%
            </div>
          )}

          {/* Refresh - web only */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={onRefresh}
              aria-label="Refresh"
            >
              <RefreshCw className="size-4" />
            </Button>
          )}

          {/* Notifications - mobile only */}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>

          {/* User avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="User menu"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <UserAvatarMenuItems />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary header bar (content context) */}
      {hasSecondaryContent && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-t border-border/60">
          <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={onBack}
                aria-label="Go back"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              {breadcrumbs.length > 0 && (
                <p className="text-muted-foreground text-xs sm:text-sm truncate">
                  {breadcrumbs.join(" / ")}
                </p>
              )}
              {title && (
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="font-semibold text-foreground truncate text-base sm:text-lg">
                    {title}
                  </h1>
                  {onFavoriteToggle && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={onFavoriteToggle}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      className="shrink-0"
                    >
                      <Star
                        className={cn("size-4", isFavorite && "fill-amber-400 text-amber-500")}
                      />
                    </Button>
                  )}
                  {needsAttention && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-amber-100 text-amber-800 border-amber-200 hidden sm:inline-flex"
                    >
                      Needs Attention
                    </Badge>
                  )}
                  {needsAttention && (
                    <span
                      className="sm:hidden size-2 rounded-full bg-amber-500 shrink-0"
                      title="Needs Attention"
                      aria-hidden
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {progressValue != null && (
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-muted-foreground text-xs">Progress</span>
                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
                  />
                </div>
              </div>
            )}

            {contentXp != null && contentXp > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                {contentXp} XP
              </Badge>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
