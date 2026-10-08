export type Lang = 'ru' | 'en';
export type Localized = Record<Lang, string>;

export type CaseStatus = 'default' | 'featured' | 'soon';

export interface CaseItem {
  id: string;
  title: string;
  description: Localized;
  tags: string[];
  status: CaseStatus;
  /** Case page URL; omitted for "soon" cases. */
  href?: string;
  /** Cover image in /public (16:9). Placeholder is shown while it is missing. */
  cover?: string;
  coverLabel: Localized;
}

export const profile = {
  name: { ru: 'Даниил Тынчеров', en: 'Daniil Tyncherov' } satisfies Localized,
  role: 'Product designer',
  level: '25 lvl',
  /** Portrait in /public (5:4). Placeholder is shown while it is missing. */
  portrait: undefined as string | undefined,
  bio: {
    ru: 'Проектирую мобильные приложения и веб-сервисы. Веду задачу от исследования до передачи в разработку.',
    en: 'I design mobile apps and web services. I take a task from research through to developer handoff.',
  } satisfies Localized,
  skills: ['Figma', 'Claude', 'Codex', 'Framer', 'Miro', 'Xcode'],
  contacts: [
    {
      label: 'Email',
      value: 'tyncherovmail@icloud.com',
      href: 'mailto:tyncherovmail@icloud.com',
      external: false,
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/daniil-tyncherov',
      href: 'https://www.linkedin.com/in/daniil-tyncherov-455b713a8',
      external: true,
    },
  ],
  cvHref: '#',
  telegramHref: 'https://t.me/everlastinghate',
};

export const cases: CaseItem[] = [
  {
    id: 'bittvpn',
    title: 'BittVPN client',
    description: {
      ru: 'Telegram Mini App для безопасного доступа в интернет через VPN',
      en: 'A Telegram Mini App for secure internet access over VPN',
    },
    tags: ['B2C', '2026'],
    status: 'featured',
    href: '#',
    coverLabel: { ru: 'Обложка — BittVPN', en: 'Cover — BittVPN' },
  },
  {
    id: 'psb',
    title: 'PSB-Bank Redesign concept',
    description: {
      ru: 'Переосмысление ключевых сценариев в мобильном приложении банка',
      en: "Rethinking the core flows in a bank's mobile app",
    },
    tags: ['B2C', '2026'],
    status: 'default',
    href: '#',
    coverLabel: { ru: 'Обложка — PSB', en: 'Cover — PSB' },
  },
  {
    id: 'wb-moneybox',
    title: 'WB Bank moneybox concept',
    description: {
      ru: 'Переосмысление сценария копилки в банковском приложении',
      en: 'Rethinking the savings-jar flow in a banking app',
    },
    tags: ['B2B', '2025'],
    status: 'soon',
    coverLabel: { ru: 'Обложка кейса', en: 'Case cover' },
  },
];

export const ui = {
  skills: { ru: 'Навыки', en: 'Skills' },
  soon: { ru: 'Скоро', en: 'Soon' },
  footer: { ru: 'Даниил Тынчеров — 2026', en: 'Daniil Tyncherov — 2026' },
  portrait: { ru: 'Портрет', en: 'Portrait' },
  openCase: { ru: 'Открыть кейс', en: 'Open case' },
} satisfies Record<string, Localized>;
