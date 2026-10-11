import type { ImgHTMLAttributes } from 'react';
import { asset } from '../asset';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

export default function Image({ src, fill, priority, unoptimized, style, ...props }: Props) {
  const local = src.startsWith('/') ? asset(src) : src;
  return (
    <img
      {...props}
      src={local}
      style={
        fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style } : style
      }
    />
  );
}
