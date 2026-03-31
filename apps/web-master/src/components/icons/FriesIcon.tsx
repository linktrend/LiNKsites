export function FriesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top line - longest, aligned right */}
      <line x1="3" y1="6" x2="21" y2="6" />
      {/* Middle line - medium, aligned right */}
      <line x1="7" y1="12" x2="21" y2="12" />
      {/* Bottom line - shortest, aligned right */}
      <line x1="11" y1="18" x2="21" y2="18" />
    </svg>
  );
}






