export function IconMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 54 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8H24V16H0Z M8 0H16V24H8Z M30 8H54V16H30Z"
      />
    </svg>
  );
}
