export function RobotIcon({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head */}
      <rect x="4" y="6" width="16" height="12" rx="2" />
      {/* Antenna */}
      <line x1="12" y1="6" x2="12" y2="2" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />
      {/* Mouth */}
      <path d="M9 15h6" />
      {/* Ears */}
      <line x1="4" y1="10" x2="2" y2="10" />
      <line x1="4" y1="14" x2="2" y2="14" />
      <line x1="20" y1="10" x2="22" y2="10" />
      <line x1="20" y1="14" x2="22" y2="14" />
    </svg>
  )
}
