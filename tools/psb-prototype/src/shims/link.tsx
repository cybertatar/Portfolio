import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useNavigation } from './navigation';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  'data-track'?: string;
};

export default function Link({
  href,
  children,
  onClick,
  prefetch,
  scroll,
  replace,
  ...props
}: Props) {
  const navigation = useNavigation();
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (props['data-track'] === 'navigation.back') navigation.back(href);
    else if (replace) navigation.replace(href);
    else navigation.push(href);
  };
  return (
    <a
      {...props}
      href={`#${href}`}
      onPointerDown={(event) => {
        if (props['data-track'] === 'navigation.back') event.stopPropagation();
        props.onPointerDown?.(event);
      }}
      onClick={click}
    >
      {children}
    </a>
  );
}
