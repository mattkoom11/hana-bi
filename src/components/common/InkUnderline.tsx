import { cn } from "@/lib/utils";

interface InkUnderlineProps {
  className?: string;
  width?: number;
  strokeWidth?: number;
}

export function InkUnderline({
  className,
  width = 160,
  strokeWidth = 2,
}: InkUnderlineProps) {
  return (
    <svg
      className={cn("text-[var(--hb-sienna)]", className)}
      width={width}
      height={20}
      viewBox={`0 0 ${width} 20`}
      fill="none"
    >
      <path
        d={`M2 14 Q ${width / 3} 2, ${width / 2} 12 T ${width - 4} 14`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
    </svg>
  );
}

