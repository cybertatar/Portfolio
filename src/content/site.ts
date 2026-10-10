export type Lang = 'ru' | 'en';
export type Localized = Record<Lang, string>;

import type { PixelIconName } from './pixel-icons';

export type CaseStatus = 'default' | 'soon';

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
  /** Birth date (YYYY-MM-DD): the level badge shows the age and counts up on its own. */
  birthday: '2000-11-09',
  /** Portrait in /public (5:4). Placeholder is shown while it is missing. */
  portrait: 'assets/portrait.jpg' as string | undefined,
  bio: {
    ru: 'Проектирую мобильные приложения и веб-сервисы. Веду задачу от исследования до передачи в разработку.',
    en: 'I design mobile apps and web services. I take a task from research through to developer handoff.',
  } satisfies Localized,
  /** Availability line under the role; set to undefined to hide it. */
  status: { ru: 'Открыт к предложениям', en: 'Open to offers' } as Localized | undefined,
  contacts: [
    {
      label: 'Email',
      icon: 'mail',
      value: 'tyncherovmail@icloud.com',
      href: 'mailto:tyncherovmail@icloud.com',
      external: false,
    },
    {
      label: 'LinkedIn',
      icon: 'linkedin',
      value: 'linkedin.com/in/daniil-tyncherov',
      href: 'https://www.linkedin.com/in/daniil-tyncherov-455b713a8',
      external: true,
    },
  ] satisfies {
    label: string;
    icon: PixelIconName;
    value: string;
    href: string;
    external: boolean;
  }[],
  cvHref: '#',
  telegramHref: 'https://t.me/everlastinghate',
  /** Every place to find me, as a row of icons at the bottom of the footer. */
  socials: [
    { label: 'Telegram', icon: 'telegram', href: 'https://t.me/everlastinghate' },
    { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/daniil.tyncherov/' },
    { label: 'Discord', icon: 'discord', href: 'https://discord.com/users/1100882718578978886' },
    {
      label: 'LinkedIn',
      icon: 'linkedin',
      href: 'https://www.linkedin.com/in/daniil-tyncherov-455b713a8',
    },
    { label: 'Email', icon: 'mail', href: 'mailto:tyncherovmail@icloud.com' },
    { label: 'GitHub', icon: 'github', href: 'https://github.com/cybertatar' },
    { label: 'Figma', icon: 'figma', href: 'https://www.figma.com/@daniiltyncherov' },
  ] satisfies { label: string; icon: PixelIconName; href: string }[],
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
    status: 'default',
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
    cover: 'assets/cases/psb-cover.webp',
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
  class: { ru: 'Класс', en: 'Class' },
  locked: { ru: 'Откроется позже', en: 'Unlocks later' },
  noMana: {
    ru: 'Не хватает маны. Этот кейс откроется позже.',
    en: 'Not enough mana. This case unlocks later.',
  },
  levelUp: { ru: 'Level up! Теперь {n} lvl.', en: 'Level up! Now {n} lvl.' },
  portrait: { ru: 'Портрет', en: 'Portrait' },
  openCase: { ru: 'Открыть кейс', en: 'Open case' },
} satisfies Record<string, Localized>;
