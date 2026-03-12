"use client"

import { forwardRef, Fragment, useMemo } from "react"

// --- Tiptap UI Primitive ---
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tiptap-ui-primitive/tooltip"

// --- Lib ---
import { cn, parseShortcutKeys } from "@/lib/tiptap-utils"

const buttonBaseClasses =
  "inline-flex h-8 min-h-8 min-w-8 items-center justify-center gap-1 rounded-lg border-0 p-2 text-sm font-medium transition-[background,color,opacity] duration-200 focus-visible:outline-none " +
  "bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 " +
  "data-[highlighted=true]:bg-neutral-200 data-[highlighted=true]:text-neutral-900 " +
  "data-[focus-visible=true]:bg-neutral-200 data-[focus-visible=true]:text-neutral-900 " +
  "data-[state=open]:bg-neutral-200/80 data-[state=open]:text-neutral-900 " +
  "data-[active-state=on]:bg-neutral-200/80 data-[active-state=on]:text-neutral-900 " +
  "disabled:bg-neutral-50 disabled:text-neutral-400 " +
  "data-[style=ghost]:bg-transparent data-[style=ghost]:hover:bg-neutral-200 data-[style=ghost]:data-[state=open]:bg-neutral-100 data-[style=ghost]:data-[active-state=on]:bg-neutral-100 " +
  "data-[style=primary]:bg-primary data-[style=primary]:text-primary-foreground data-[style=primary]:hover:bg-primary/90 data-[style=primary]:data-[state=open]:bg-primary-100 data-[style=primary]:data-[state=open]:text-neutral-900 " +
  "data-[size=large]:h-[2.375rem] data-[size=large]:min-h-[2.375rem] data-[size=large]:min-w-[2.375rem] data-[size=large]:p-2.5 data-[size=large]:text-[0.9375rem] " +
  "data-[size=small]:h-6 data-[size=small]:min-h-6 data-[size=small]:min-w-6 data-[size=small]:rounded-md data-[size=small]:p-1.5 data-[size=small]:text-xs " +
  "[&_.tiptap-button-icon]:size-4 [&_.tiptap-button-icon-sub]:size-4 [&_.tiptap-button-dropdown-arrows]:size-3 [&_.tiptap-button-dropdown-small]:size-2.5 " +
  "[&[data-size=large]_.tiptap-button-icon]:size-[1.125rem] [&[data-size=large]_.tiptap-button-icon-sub]:size-[1.125rem] " +
  "[&[data-size=small]_.tiptap-button-icon]:size-3.5 [&[data-size=small]_.tiptap-button-icon-sub]:size-3.5 " +
  "[&_.tiptap-button-text]:grow [&_.tiptap-button-text]:px-0.5 [&_.tiptap-button-text]:text-left [&_.tiptap-button-text]:leading-6"

const buttonGroupClasses =
  "relative flex align-middle " +
  "data-[orientation=vertical]:min-w-max data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-center [&[data-orientation=vertical]>*]:w-full " +
  "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=horizontal]:gap-0.5"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn(buttonBaseClasses, className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn(buttonBaseClasses, className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    )
  }
)

Button.displayName = "Button"

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(buttonGroupClasses, className)}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

export default Button
