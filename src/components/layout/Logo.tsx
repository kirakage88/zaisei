export function Logo({ className }: { className?: string }) {
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
      <line
        x1="0"
        y1="36"
        x2="32"
        y2="36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
