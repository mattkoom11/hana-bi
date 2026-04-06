import { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

interface FillLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  external?: boolean;
}

export function FillLink({
  href,
  children,
  className = '',
  style,
  external = false,
}: FillLinkProps) {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      href={href}
      className={`fill-link inline-flex items-center ${className}`}
      style={style}
      {...externalProps}
    >
      <span className="fill-link__bg" aria-hidden="true" />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
