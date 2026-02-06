interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Abstract geometric S - three stacked parallelograms */}
      <path
        d="M6 4H16L14 8H4L6 4Z"
        fill="currentColor"
      />
      <path
        d="M8 10H18L16 14H6L8 10Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M10 16H20L18 20H8L10 16Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}
