import { createContext, useContext, useState, type ReactNode } from 'react';

type Navigation = {
  route: string;
  direction: 'forward' | 'back';
  push: (href: string) => void;
  replace: (href: string) => void;
  back: (fallbackHref?: string) => void;
};

const Context = createContext<Navigation | null>(null);

export function NavigationProvider({
  initialRoute,
  onNavigate,
  children,
}: {
  initialRoute: string;
  onNavigate?: (route: string) => void;
  children: ReactNode;
}) {
  const [history, setHistory] = useState([initialRoute]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const route = history[history.length - 1];
  const push = (href: string) => {
    if (href === route) return;
    setDirection('forward');
    onNavigate?.(href);
    setHistory((current) => [...current, href]);
  };
  const replace = (href: string) => {
    onNavigate?.(href);
    setHistory((current) => [...current.slice(0, -1), href]);
  };
  const back = (fallbackHref = '/') => {
    setDirection('back');
    const previous = history.length > 1 ? history[history.length - 2] : fallbackHref;
    onNavigate?.(previous);
    setHistory((current) => (current.length > 1 ? current.slice(0, -1) : [previous]));
  };
  return (
    <Context.Provider value={{ route, direction, push, replace, back }}>
      {children}
    </Context.Provider>
  );
}

export function useNavigation() {
  const value = useContext(Context);
  if (!value) throw new Error('NavigationProvider is missing');
  return value;
}

export function usePathname() {
  return useNavigation().route.split('?')[0];
}

export function useSearchParams() {
  return new URLSearchParams(useNavigation().route.split('?')[1] || '');
}

export function useRouter() {
  const navigation = useNavigation();
  return {
    push: navigation.push,
    replace: navigation.replace,
    back: navigation.back,
    prefetch: async () => {},
  };
}
