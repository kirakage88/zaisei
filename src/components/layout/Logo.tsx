import { useTheme } from "@/components/theme-provider"

export function Logo({ className }: { className?: string }) {
  const { palette } = useTheme()

  return (
    <svg
      viewBox="0 0 160 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="28"
        fill="currentColor"
        fontFamily="'Zen Old Mincho', 'Noto Serif JP', serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="1"
      >
        Zaisei
      </text>
      {palette === "sakura" ? (
        <g transform="translate(0, 32)" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6,0 C4.5,1.5 4,3 6,4 C8,3 7.5,1.5 6,0" transform="translate(10, 0)" />
          <path d="M6,0 C4.5,1.5 4,3 6,4 C8,3 7.5,1.5 6,0" transform="translate(10, 0) rotate(72 6 2)" />
          <path d="M6,0 C4.5,1.5 4,3 6,4 C8,3 7.5,1.5 6,0" transform="translate(10, 0) rotate(144 6 2)" />
          <path d="M6,0 C4.5,1.5 4,3 6,4 C8,3 7.5,1.5 6,0" transform="translate(10, 0) rotate(216 6 2)" />
          <path d="M6,0 C4.5,1.5 4,3 6,4 C8,3 7.5,1.5 6,0" transform="translate(10, 0) rotate(288 6 2)" />
        </g>
      ) : (
        <line
          x1="0"
          y1="36"
          x2="32"
          y2="36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
