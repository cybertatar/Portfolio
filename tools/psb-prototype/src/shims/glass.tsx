import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  width?: number;
  height?: number;
  radius?: number;
  optics?: unknown;
};

export function Glass({
  children,
  className = '',
  width,
  height,
  radius,
  optics,
  style,
  ...props
}: Props) {
  const geometry: CSSProperties = {
    position: 'relative',
    width,
    height,
    borderRadius: radius,
    overflow: 'hidden',
    ...style,
  };
  return (
    <div {...props} className={`${className} portfolio-glass`} style={geometry}>
      {children}
    </div>
  );
}
