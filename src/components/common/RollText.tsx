interface RollTextProps {
  children: string;
  className?: string;
}

export function RollText({ children, className }: RollTextProps) {
  const easing = 'cubic-bezier(0.23, 1, 0.32, 1)';

  return (
    <span className={`relative inline-block overflow-hidden leading-[1] ${className ?? ''}`}>
      {/* Top copy — squishes upward on hover */}
      <span
        className="block group-hover:translate-y-[-110%] group-hover:scale-y-[4] transition-transform duration-[600ms] origin-bottom leading-[1]"
        style={{ transitionTimingFunction: easing }}
        aria-hidden="false"
      >
        {children}
      </span>
      {/* Bottom copy — rolls in from below on hover */}
      <span
        className="block absolute inset-0 translate-y-[100%] scale-y-[4] group-hover:translate-y-0 group-hover:scale-y-[1] transition-transform duration-[600ms] origin-top leading-[1]"
        style={{ transitionTimingFunction: easing }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}
