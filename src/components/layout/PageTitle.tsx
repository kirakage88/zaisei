import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  const { palette } = useTheme()

  if (palette === "sakura") {
    return (
      <div className={cn("relative py-4", className)}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[140px] w-[140px] text-accent-active pointer-events-none"
          style={{ opacity: 0.06 }}
          aria-hidden="true"
        >
          <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" />
          <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(72 8 8)" />
          <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(144 8 8)" />
          <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(216 8 8)" />
          <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(288 8 8)" />
        </svg>
        <h1 className="relative text-2xl font-display font-black">
          {children}
        </h1>
      </div>
    )
  }

  return (
    <h1 className={cn("text-2xl font-display font-black accent-underline", className)}>
      {children}
    </h1>
  )
}
