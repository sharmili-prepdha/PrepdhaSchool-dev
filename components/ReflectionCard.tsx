import { cn } from "@/lib/utils";

export interface ReflectionCardProps {
  /** Pill label at the top (e.g. "REFLECTION"). */
  label: string;
  /** Main heading below the label. */
  title: string;
  /** Body text or question. */
  body: string;
  className?: string;
}

export function ReflectionCard({
  label,
  title,
  body,
  className,
}: ReflectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-sm",
        "min-w-0 max-w-2xl",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "bg-amber-200/90 text-foreground",
            "text-xs font-semibold uppercase tracking-wide"
          )}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
          {label}
        </span>
      </div>
      <h2 className="mb-2 font-semibold text-foreground text-lg">{title}</h2>
      <p className="text-amber-900/80 text-[15px] leading-snug">{body}</p>
    </div>
  );
}
