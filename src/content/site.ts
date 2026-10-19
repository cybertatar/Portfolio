export type Lang = 'ru' | 'en';
export type Localized = Record<Lang, string>;
/** Text that is either the same in both languages or given in both. */
export type Text = string | Localized;

/** The Russian text that goes into the HTML. */
export const ru = (t: Text) => (typeof t === 'string' ? t : t.ru);
/** The English text for a data-en attribute; nothing when it's the same in both languages. */
export const en = (t: Text | undefined) =>
  t === undefined || typeof t === 'string' ? undefined : t.en;

import type { PixelIconName } from './pixel-icons';

/** soon: locked until the case is ready; nda: never opens, the card is marked NDA. */
export type CaseStatus = 'default' | 'soon' | 'nda';

export interface CaseItem {
  id: string;
  title: string;
  description: Localized;
  tags: string[];
  status: CaseStatus;
  /** Case page path inside the site (e.g. 'cases/psb/'), or '#' until it exists; omitted for locked (soon, nda) cases. */
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
    en: 'I design mobile apps and web services. I take projects from research through to developer handoff.',
  } satisfies Localized,
  /** Availability line under the role; set to undefined to hide it. */
  status: { ru: 'Открыт к предложениям', en: 'Open to opportunities' } as Localized | undefined,
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
    cover: 'assets/cases/bittvpn-cover.webp',
    coverLabel: { ru: 'Обложка — BittVPN', en: 'Cover — BittVPN' },
  },
  {
    id: 'psb',
    title: 'PSB-Bank Redesign concept',
    description: {
      ru: 'Переосмысление ключевых сценариев в мобильном приложении банка',
      en: 'Rethinking the core flows in a bank’s mobile app',
    },
    tags: ['B2C', '2026'],
    status: 'default',
    href: 'cases/psb/',
    cover: 'assets/cases/psb-cover.webp',
    coverLabel: { ru: 'Обложка — PSB', en: 'Cover — PSB' },
  },
  {
    id: 'ozon-sticker',
    title: 'Ozon Bank payment sticker reimagined',
    description: {
      ru: 'Переосмысление платёжного стикера Ozon Банка',
      en: 'Reimagining Ozon Bank’s payment sticker',
    },
    tags: ['Suppose', '2026'],
    status: 'soon',
    cover: 'assets/cases/ozon-cover.webp',
    coverLabel: { ru: 'Обложка кейса', en: 'Case cover' },
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
    cover: 'assets/cases/wb-cover.webp',
    coverLabel: { ru: 'Обложка кейса', en: 'Case cover' },
  },
  {
    id: 'mouette',
    title: 'Mouette online clothing store',
    description: {
      ru: 'Интернет-магазин одежды для ателье',
      en: 'An online clothing store for a tailoring studio',
    },
    tags: ['B2C', '2025'],
    status: 'nda',
    cover: 'assets/cases/mouette-cover.webp',
    coverLabel: { ru: 'Обложка — Mouette', en: 'Cover — Mouette' },
  },
];

/** Small side projects: a repo and an Instagram post each, shown above the cases. */
export interface SideQuest {
  id: string;
  title: Text;
  description: Localized;
  /** Square app icon in /public. */
  icon: string;
  /** Where the project itself runs (a Telegram bot), if anywhere: the main button. */
  app?: string;
  github: string;
  /** Post with the carousel about it, if there is one. */
  instagram?: string;
}

export const sideQuests: SideQuest[] = [
  {
    id: 'ux-trainer',
    title: { ru: 'UX-тренажёр', en: 'UX Trainer' },
    description: {
      ru: 'Тесты по UX и UI в Telegram, для дизайн-сообщества',
      en: 'UX and UI quizzes in Telegram, for the design community',
    },
    icon: 'assets/side/kegl.webp',
    app: 'https://t.me/uxuitrainer_bot',
    github: 'https://github.com/cybertatar/uxuieducationminiapp',
    instagram: 'https://www.instagram.com/p/DesDduPEYEN/',
  },
  {
    id: 'ytm-timecodes',
    title: { ru: 'Таймкоды для YouTube Music', en: 'YouTube Music Timecodes' },
    description: {
      ru: 'Расширение для браузера: треклист прямо в плеере',
      en: 'A browser extension: the tracklist right in the player',
    },
    icon: 'assets/side/ytm.webp',
    github: 'https://github.com/cybertatar/YouTubeMusicTimecodePlugin',
  },
  {
    id: 'sunboy-shaman',
    title: { ru: 'Санбой Шаман', en: 'Sunboy Shaman' },
    description: {
      ru: 'Приложение для Mac: пишешь как Пророк Санбой',
      en: 'A Mac app: type like Prophet Sunboy',
    },
    icon: 'assets/side/shaman.webp',
    github: 'https://github.com/cybertatar/sunnyshamanlang',
    instagram: 'https://www.instagram.com/p/Depdy6fkVX7/',
  },
  {
    id: 'dobro',
    title: { ru: '=Добро и позитив=', en: '=Kindness and Positivity=' },
    description: {
      ru: 'Приложение для Mac: =добро и позитив= в каждом сообщении',
      en: 'A Mac app: =kindness and positivity= in every message',
    },
    icon: 'assets/side/dobro.webp',
    github: 'https://github.com/cybertatar/DOBROANDPOZITIV',
    instagram: 'https://www.instagram.com/p/DepKV4VDKQ9/',
  },
];

export const ui = {
  class: { ru: 'Класс', en: 'Class' },
  locked: { ru: 'Откроется позже', en: 'Unlocks later' },
  noMana: {
    ru: 'Не хватает маны. Этот кейс откроется позже.',
    en: 'Not enough mana. This case unlocks later.',
  },
  noWay: {
    ru: 'В эти края пути нет. Кейс под NDA.',
    en: 'There is no road to these lands. This case is under NDA.',
  },
  levelUp: { ru: 'Level up! Теперь {n} lvl.', en: 'Level up! Now level {n}.' },
  portrait: { ru: 'Портрет', en: 'Portrait' },
  openCase: { ru: 'Открыть кейс', en: 'Open case' },
  bot: { ru: 'Бот', en: 'Bot' },
  prev: { ru: 'Назад', en: 'Previous' },
  next: { ru: 'Дальше', en: 'Next' },
  sideQuests: { ru: 'Побочные квесты', en: 'Side quests' },
  repo: { ru: 'Код на GitHub', en: 'Code on GitHub' },
  post: { ru: 'Пост в Instagram', en: 'Post on Instagram' },
} satisfies Record<string, Localized>;
