import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '@routes/page';
import Account from '@routes/account/page';
import Card from '@routes/card/page';
import Cashback from '@routes/cashback/page';
import Categories from '@routes/cashback/categories/page';
import Link from 'next/link';
import uiStyles from '@/components/ui/ui.module.css';
import bankStyles from '@/features/bank/bank.module.css';
import '@/app/globals.css';
import { NavigationProvider, useNavigation, usePathname } from 'next/navigation';
import { PortfolioProvider } from './shims/participant-provider';
import { asset } from './asset';

declare global {
  interface Window {
    __psbPortfolioCss?: string;
    __psbPortfolioViewport?: () => HTMLElement | null;
    __psbPortfolioSearch?: () => string;
  }
}

class DemoErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="portfolio-error" role="alert">
        Не удалось открыть прототип. Обновите страницу.
      </div>
    ) : (
      this.props.children
    );
  }
}

const tabs = [
  {
    href: '/',
    label: 'Главная',
    icon: asset('figma/home/tab-home.svg'),
    dataTrack: 'tab.home.open',
  },
  {
    href: '/payment',
    label: 'Платежи',
    icon: asset('figma/home/tab-payments.svg'),
    dataTrack: 'tab.payments.unavailable',
    unavailable: true,
  },
  {
    href: '/cashback',
    label: 'Выгода',
    icon: asset('figma/home/tab-benefit.svg'),
    dataTrack: 'cashback.tab.open',
  },
  {
    href: '/chat',
    label: 'Чат',
    icon: asset('figma/home/tab-chat.svg'),
    dataTrack: 'tab.chat.unavailable',
    unavailable: true,
  },
  {
    href: '/more',
    label: 'Ещё',
    icon: asset('figma/home/tab-more.svg'),
    dataTrack: 'tab.more.unavailable',
    unavailable: true,
  },
];

function PortfolioTabbar({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Основная навигация" className={uiStyles.tabbar}>
      {tabs.map((item) => {
        const active =
          !item.unavailable &&
          (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));
        const content = (
          <>
            <img
              className="portfolio-tab-icon"
              src={item.icon}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="sync"
              draggable={false}
            />
            <span>{item.label}</span>
          </>
        );
        const className = `${uiStyles.tab} ${active ? `${uiStyles.tabActive} portfolio-tab-active` : ''}`;
        return item.unavailable ? (
          <button
            key={item.href}
            type="button"
            className={className}
            aria-label={`${item.label}: недоступно в демо`}
            data-track={item.dataTrack}
            onClick={() => window.dispatchEvent(new Event('portfolio:unavailable'))}
          >
            {content}
          </button>
        ) : (
          <Link key={item.href} href={item.href} className={className} data-track={item.dataTrack}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

function PageForRoute({ route }: { route: string }) {
  const path = route.split('?')[0];
  const Page =
    path === '/account'
      ? Account
      : path === '/card'
        ? Card
        : path === '/cashback'
          ? Cashback
          : path === '/cashback/categories'
            ? Categories
            : Home;
  return <Page />;
}

function App() {
  const pathname = usePathname();
  const { route } = useNavigation();
  const [notice, setNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [route]);
  useEffect(() => {
    const host = (scrollRef.current?.getRootNode() as ShadowRoot | undefined)?.host as
      HTMLElement | undefined;
    if (!host) return;
    const frame = requestAnimationFrame(() => {
      host.dataset.psbReady = 'true';
      host.dispatchEvent(new Event('psb-phone-ready', { bubbles: true }));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const show = () => {
      setNotice(true);
      window.setTimeout(() => setNotice(false), 2100);
    };
    window.addEventListener('portfolio:unavailable', show);
    return () => window.removeEventListener('portfolio:unavailable', show);
  }, []);
  const hideTabs =
    pathname === '/account' || pathname === '/card' || pathname === '/cashback/categories';
  const surface =
    pathname === '/'
      ? 'portfolio-home'
      : pathname === '/cashback'
        ? 'portfolio-cashback'
        : pathname === '/cashback/categories'
          ? 'portfolio-categories'
          : pathname === '/account'
            ? 'portfolio-account'
            : pathname === '/card'
              ? 'portfolio-card'
              : '';
  return (
    <div className="participant-stage">
      <div className={`participant-phone ${bankStyles.bankUiRoot} ${surface}`}>
        <div className="portfolio-statusbar" aria-label="Время 9:41">
          <strong>9:41</strong>
          <span className="portfolio-island" aria-hidden="true" />
          <span className="portfolio-status-icons" aria-hidden="true">
            <img src={asset('figma/icons/status-cell.svg')} alt="" />
            <img src={asset('figma/icons/status-wifi.svg')} alt="" />
            <img src={asset('figma/icons/status-battery.svg')} alt="" />
          </span>
        </div>
        <div
          className="participant-content"
          ref={scrollRef}
          onPointerDownCapture={(event) => {
            if ((event.target as Element).closest('[data-track="navigation.back"]'))
              event.stopPropagation();
          }}
        >
          <div className="participant-route-surface portfolio-route" key={route}>
            <PageForRoute route={route} />
          </div>
        </div>
        {notice && (
          <div className="portfolio-notice" role="status">
            Недоступно в демо
          </div>
        )}
        {!hideTabs && <PortfolioTabbar pathname={pathname} />}
      </div>
    </div>
  );
}

const viewportCss = `
:host{display:block;width:100%;height:100%;min-height:0;background:#0a0c0f;color:#fff;--app-tg-safe-top:0px;--app-tg-safe-bottom:0px}
.participant-stage{display:block;width:402px;height:var(--prototype-height,874px);min-height:0;padding:0;transform:scale(var(--prototype-scale,.805970149));transform-origin:top left}
.participant-phone{display:flex;flex-direction:column;width:402px;height:var(--prototype-height,874px);min-height:0}
.participant-phone>nav[aria-label="Основная навигация"]{border-bottom-left-radius:var(--prototype-radius,0)!important;border-bottom-right-radius:var(--prototype-radius,0)!important}
.participant-phone .portfolio-route [class*="bankHeader"]::before,
.participant-phone .portfolio-route [class*="bankHeader"]::after{border-top-left-radius:var(--prototype-radius,0)!important;border-top-right-radius:var(--prototype-radius,0)!important}
.participant-content{position:relative;flex:1;height:auto;min-height:0;padding-top:54px;overscroll-behavior-y:auto;touch-action:pan-y}
.participant-phone.portfolio-home{background:var(--bg-page)}
.participant-phone.portfolio-home .participant-content{padding-top:0;background:var(--bg-page)}
/* The top block (header, accounts) runs up under the status bar, as in the app */
.participant-phone.portfolio-home .portfolio-route>main{padding-top:54px;background:linear-gradient(to bottom,var(--bg-surface) 0 74px,var(--bg-page) 74px)}
.participant-phone.portfolio-home .portfolio-statusbar{background:transparent}
.participant-phone.portfolio-home .portfolio-route [class*="bankHeader"]{background:transparent}
.participant-phone.portfolio-home .portfolio-route [class*="bankHeader"]::before,
.participant-phone.portfolio-home .portfolio-route [class*="bankHeader"]::after{inset:-54px 0 -4px;border-radius:0 0 20px 20px}
.participant-phone:is(.portfolio-cashback,.portfolio-categories,.portfolio-account,.portfolio-card) .participant-content{padding-top:0}
.participant-phone:is(.portfolio-cashback,.portfolio-categories,.portfolio-account,.portfolio-card) .portfolio-route>main{padding-top:54px}
.participant-phone.portfolio-cashback .portfolio-route>main,
.participant-phone.portfolio-cashback [class*="_cashbackScreen"]{background:linear-gradient(to bottom,var(--bg-surface) 0 124px,var(--bg-page) 124px)}
.participant-phone:is(.portfolio-cashback,.portfolio-categories,.portfolio-account,.portfolio-card) .portfolio-route [class*="bankHeader"]::before,
.participant-phone:is(.portfolio-cashback,.portfolio-categories,.portfolio-account,.portfolio-card) .portfolio-route [class*="bankHeader"]::after{top:-54px}
.participant-phone.portfolio-cashback .portfolio-route [class*="bankHeader"]::before{background:rgba(22,26,32,.72);-webkit-backdrop-filter:blur(10px) saturate(1.08);backdrop-filter:blur(10px) saturate(1.08);border-radius:0 0 20px 20px}
.participant-phone.portfolio-cashback .portfolio-route [class*="bankHeader"]::after{-webkit-backdrop-filter:none;backdrop-filter:none}
.portfolio-route>main{overscroll-behavior-y:auto}
.portfolio-statusbar{position:absolute;z-index:35;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;height:54px;padding:11px 28px 5px 36px;background:transparent;color:#fff;font:600 17px/21px "SF Pro Display","Onest Variable",Onest,system-ui,sans-serif;pointer-events:none}
.portfolio-statusbar strong,.portfolio-status-icons{position:relative;z-index:1}
.portfolio-statusbar strong{font-weight:500}
.portfolio-island{position:absolute;left:50%;top:var(--prototype-island-top,15px);width:var(--prototype-island-width,124px);height:var(--prototype-island-height,36px);border-radius:20px;background:#000;transform:translateX(-50%);pointer-events:none}
.portfolio-status-icons{display:flex;align-items:center;gap:7px;height:16px}
.portfolio-status-icons img{display:block;object-fit:contain}
.portfolio-status-icons img:nth-child(1){width:19.2px;height:12.23px}
.portfolio-status-icons img:nth-child(2){width:17.14px;height:12.33px}
.portfolio-status-icons img:nth-child(3){width:27.33px;height:13px}
.portfolio-tab-icon{display:block;width:24px;height:24px;object-fit:contain}
.participant-phone>nav[aria-label="Основная навигация"]{height:88px;padding:12px 16px 33px;bottom:0;border-radius:32px 32px 0 0}
.participant-content:has(~nav[aria-label="Основная навигация"]){padding-bottom:calc(24px + 88px)}
.portfolio-tab-active .portfolio-tab-icon{filter:brightness(0) saturate(100%) invert(49%) sepia(78%) saturate(1383%) hue-rotate(335deg) brightness(102%) contrast(95%)}
.portfolio-glass{backdrop-filter:blur(8px) saturate(1.08);-webkit-backdrop-filter:blur(8px) saturate(1.08);box-shadow:inset 0 0 0 1px #ffffff2b,inset 0 1px #ffffff24,0 6px 15px #0003}
[class*="backGlassPull"]{transform:none!important;transition:none!important}
.portfolio-route{position:relative;z-index:2;min-height:100%;background:#0a0c0f;animation:none!important;transform:none!important}
.portfolio-route [class*="bankHeader"]{top:54px}
.portfolio-notice{position:absolute;z-index:100;left:50%;bottom:84px;transform:translateX(-50%);width:max-content;max-width:90%;padding:10px 14px;border-radius:16px;background:#242a33;color:#fff;font:12px Onest,system-ui,sans-serif;box-shadow:0 10px 24px #0008}
.portfolio-error{display:grid;place-items:center;min-height:100%;padding:24px;text-align:center;font:14px/1.45 Onest,system-ui,sans-serif;color:#fff;background:#0a0c0f}
`;

let activeHost: HTMLElement | null = null;
window.__psbPortfolioViewport = () =>
  activeHost?.shadowRoot?.querySelector<HTMLElement>('.participant-phone') || null;
window.__psbPortfolioSearch = () =>
  activeHost?.dataset.psbCurrentRoute?.split('?')[1]
    ? `?${activeHost.dataset.psbCurrentRoute.split('?')[1]}`
    : '';

const fonts = document.createElement('link');
fonts.rel = 'stylesheet';
fonts.href = asset('fonts.css');
document.head.append(fonts);

for (const host of document.querySelectorAll<HTMLElement>('[data-psb-live-route]')) {
  if (!window.__psbPortfolioCss) {
    host.textContent = 'Не удалось загрузить оформление прототипа. Обновите страницу.';
    continue;
  }
  activeHost ||= host;
  host.dataset.psbCurrentRoute = host.dataset.psbLiveRoute || '/';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = (window.__psbPortfolioCss || '') + viewportCss;
  const mount = document.createElement('div');
  mount.style.cssText = 'width:100%;height:100%;min-height:0';
  shadow.append(style, mount);
  host.addEventListener('pointerdown', () => {
    activeHost = host;
  });
  host.addEventListener('mousedown', (event) => event.stopPropagation());
  host.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
  host.addEventListener('dragstart', (event) => event.preventDefault());
  createRoot(mount).render(
    <DemoErrorBoundary>
      <PortfolioProvider initiallyConnected={host.dataset.psbCashback === 'connected'}>
        <NavigationProvider
          initialRoute={host.dataset.psbLiveRoute || '/'}
          onNavigate={(route) => {
            activeHost = host;
            host.dataset.psbCurrentRoute = route;
          }}
        >
          <App />
        </NavigationProvider>
      </PortfolioProvider>
    </DemoErrorBoundary>,
  );
}
