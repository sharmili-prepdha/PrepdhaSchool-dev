"use client";

import { ChevronDown, FolderOpen, GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GroupedBySubject } from "../utils/groupBySubject";

type SubjectSidebarProps = {
  grouped: GroupedBySubject;
  subjectSearch: string;
  onSubjectSearchChange: (value: string) => void;
  selectedClassSubjectId: number | null;
  onSelectClassSubject: (id: number) => void;
  isSubjectOpen: (subjectName: string) => boolean;
  onSubjectOpenChange: (subjectName: string, open: boolean) => void;
};

export function SubjectSidebar({
  grouped,
  subjectSearch,
  onSubjectSearchChange,
  selectedClassSubjectId,
  onSelectClassSubject,
  isSubjectOpen,
  onSubjectOpenChange,
}: SubjectSidebarProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col rounded-xl border border-sidebar-border bg-card shadow-sm">
      <div className="border-b border-sidebar-border p-4 flex flex-col gap-4 text-center">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground">
          <FolderOpen className="size-4 shrink-0" />
          Browse by subject
        </h2>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subject or class..."
            value={subjectSearch}
            onChange={(e) => onSubjectSearchChange(e.target.value)}
            className="rounded-lg border-sidebar-border bg-background/50 pl-9 text-sm"
          />
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Browse by subject">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <GraduationCap className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {subjectSearch ? "No matches found." : "No class-subjects yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-1 flex flex-col gap-2">
            {grouped.map(([subjectName, items]) => (
              <Collapsible
                key={subjectName}
                className="group"
                open={isSubjectOpen(subjectName)}
                onOpenChange={(open) => onSubjectOpenChange(subjectName, open)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left font-normal"
                  >
                    <span className="truncate">{subjectName}</span>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-row gap-2 mt-2 border-l border-border pl-3">
                    {items.map((cs) => {
                      const isSelected = cs.id === selectedClassSubjectId;
                      return (
                        <Button
                          key={cs.id}
                          variant={isSelected ? "secondary" : "ghost"}
                          className={cn(
                            "flex items-center cursor-pointer justify-start rounded-md border-2 py-2 pl-3 pr-2.5 text-left font-normal",
                            isSelected ? "bg-primary" : "",
                          )}
                          onClick={() => onSelectClassSubject(cs.id)}
                        >
                          <span className="truncate">{cs.class.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
