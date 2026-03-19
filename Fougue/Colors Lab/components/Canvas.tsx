import { ReactNode } from "react";

interface CanvasProps {
  children: ReactNode;
  camera?: { position: [number, number, number] };
  style?: React.CSSProperties;
  gl?: any;
  dpr?: [number, number];
  flat?: boolean;
  linear?: boolean;
}

/**
 * Simple Canvas wrapper that passes props to gradient components
 * This is a placeholder that lets gradient components render themselves
 */
export function Canvas({ children, ...props }: CanvasProps) {
  return <div style={{ width: '100%', height: '100%', ...props.style }}>{children}</div>;
}
