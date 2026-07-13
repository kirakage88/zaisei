export function SakuraPetal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`sakura-petal ${className ?? ""}`}
      aria-hidden="true"
    >
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" />
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(72 8 8)" />
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(144 8 8)" />
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(216 8 8)" />
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" transform="rotate(288 8 8)" />
    </svg>
  )
}

export function SinglePetal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8,3 C6,5 6,7 8,8 C10,7 10,5 8,3" />
    </svg>
  )
}
