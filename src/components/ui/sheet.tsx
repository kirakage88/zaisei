"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type Side = "top" | "right" | "bottom" | "left"

const sideAnimations: Record<Side, { open: string; closed: string }> = {
  right: { open: "sheet-slide-in-right", closed: "sheet-slide-out-right" },
  left: { open: "sheet-slide-in-left", closed: "sheet-slide-out-left" },
  bottom: { open: "sheet-slide-in-bottom", closed: "sheet-slide-out-bottom" },
  top: { open: "sheet-slide-in-top", closed: "sheet-slide-out-top" },
}

const sideClasses: Record<Side, string> = {
  right: "inset-y-0 right-0 h-full w-3/4 border-l p-6 sm:max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 border-r p-6 sm:max-w-sm",
  bottom: "inset-x-0 bottom-0 border-t px-6 pt-4 pb-6",
  top: "inset-x-0 top-0 border-b px-6 pt-6 pb-4",
}

interface SheetContextValue {
  controlled: boolean
  open: boolean
}

const SheetContext = React.createContext<SheetContextValue>({
  controlled: false,
  open: false,
})

function Sheet({
  open,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root> & { open?: boolean }) {
  const isControlled = open !== undefined
  return (
    <SheetContext.Provider value={{ controlled: isControlled, open: open ?? false }}>
      <SheetPrimitive.Root open={open} {...props}>
        {children}
      </SheetPrimitive.Root>
    </SheetContext.Provider>
  )
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: Side
  showCloseButton?: boolean
}) {
  const { controlled, open } = React.useContext(SheetContext)
  const [shouldRender, setShouldRender] = React.useState(!controlled || open)
  const [animClass, setAnimClass] = React.useState("")
  const prevOpen = React.useRef(open)

  React.useEffect(() => {
    if (!controlled) {
      // Uncontrolled: Radix manages open/close, just always render
      setShouldRender(true)
      return
    }

    if (open && !prevOpen.current) {
      setShouldRender(true)
      setAnimClass(sideAnimations[side].open)
    } else if (!open && prevOpen.current) {
      setAnimClass(sideAnimations[side].closed)
    }
    prevOpen.current = open
  }, [open, controlled, side])

  const handleAnimEnd = React.useCallback(() => {
    if (controlled && !open) {
      setShouldRender(false)
      setAnimClass("")
    }
  }, [controlled, open])

  if (!shouldRender) return null

  // Uncontrolled mode: let Radix handle everything normally
  if (!controlled) {
    return (
      <SheetPortal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <SheetPrimitive.Content
          data-slot="sheet-content"
          className={cn(
            "fixed z-50 flex flex-col bg-background shadow-lg",
            sideClasses[side],
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close className="absolute top-5 right-5 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Content>
      </SheetPortal>
    )
  }

  // Controlled mode: animate open/close
  return (
    <SheetPortal>
      <SheetPrimitive.Overlay
        forceMount
        className={cn(
          "fixed inset-0 z-50 bg-black/50",
          animClass,
          !open && "pointer-events-none"
        )}
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        forceMount
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-lg",
          sideClasses[side],
          animClass,
          !open && "pointer-events-none",
          className
        )}
        onAnimationEnd={handleAnimEnd}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-5 right-5 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 pb-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-display font-black text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
