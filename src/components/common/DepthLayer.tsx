import type { CSSProperties, ReactNode } from "react";

interface DepthLayerProps {
  children: ReactNode;
  /**
   * Z position in px. Negative = pushed back (reads as background, shifts less
   * under tilt). Positive = pulled forward (foreground, shifts more under tilt).
   */
  depth?: number;
  /** Must match the parent Tilt3DStage perspective to keep apparent size stable. */
  perspective?: number;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}

/**
 * Places its children on a fixed Z-plane inside a <Tilt3DStage>. A compensating
 * scale cancels the perspective size change so the layer keeps its on-screen
 * size while still parallaxing in true 3D.
 */
export function DepthLayer({
  children,
  depth = 0,
  perspective = 1200,
  className = "",
  style,
  "aria-hidden": ariaHidden,
}: DepthLayerProps) {
  const scale = (perspective - depth) / perspective;

  return (
    <div
      className={className}
      aria-hidden={ariaHidden}
      style={{
        transform: `translateZ(${depth}px) scale(${scale})`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
