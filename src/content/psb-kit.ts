/**
 * The PSB UI kit for the showcase on the case page (Kit.astro): every public component of the
 * Figma kit (UI-Kit page, "Master components" section of PSB-Bank-Redesign-Concept) with its
 * variant axes and one image per variant, cut from the component set exported at 2x
 * (bg_animation at 1x) on the kit's #1E1E1E canvas. Generated; descriptions are from the
 * passports where they exist.
 */
export interface KitVariant {
  props: Record<string, string>;
  src: string;
  w: number;
  h: number;
}
export interface KitComponent {
  id: string;
  title: string;
  desc: string;
  axes: { name: string; values: string[] }[];
  variants: KitVariant[];
}

export const kit: KitComponent[] = [
  {
    id: 'button',
    title: 'Button',
    desc: 'Запускает все важные действия в интерфейсе.',
    axes: [
      {
        name: 'type',
        values: ['primary', 'secondary', 'ghost', 'danger'],
      },
      {
        name: 'color',
        values: ['accent', 'neutral'],
      },
      {
        name: 'size',
        values: ['xsmall', 'small', 'medium', 'large'],
      },
      {
        name: 'radius',
        values: ['circle', 'squircle'],
      },
    ],
    variants: [
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'xsmall',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/1.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'xsmall',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/2.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'small',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/3.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'small',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/4.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'medium',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/5.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'medium',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/6.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'large',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/7.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'primary',
          color: 'accent',
          size: 'large',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/8.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'xsmall',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/9.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'xsmall',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/10.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'small',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/11.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'small',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/12.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'medium',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/13.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'medium',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/14.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'large',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/15.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'primary',
          color: 'neutral',
          size: 'large',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/16.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'xsmall',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/17.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'xsmall',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/18.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'small',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/19.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'small',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/20.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'medium',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/21.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'medium',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/22.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'large',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/23.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'secondary',
          color: 'neutral',
          size: 'large',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/24.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'xsmall',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/25.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'xsmall',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/26.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'small',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/27.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'small',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/28.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'medium',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/29.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'medium',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/30.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'large',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/31.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'ghost',
          color: 'neutral',
          size: 'large',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/32.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'xsmall',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/33.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'xsmall',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/34.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'small',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/35.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'small',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/36.webp',
        w: 130,
        h: 36,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'medium',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/37.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'medium',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/38.webp',
        w: 130,
        h: 44,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'large',
          radius: 'circle',
        },
        src: 'assets/cases/psb/kit/c/button/39.webp',
        w: 138,
        h: 52,
      },
      {
        props: {
          type: 'danger',
          color: 'neutral',
          size: 'large',
          radius: 'squircle',
        },
        src: 'assets/cases/psb/kit/c/button/40.webp',
        w: 138,
        h: 52,
      },
    ],
  },
  {
    id: 'icnbutton',
    title: 'icnButton',
    desc: 'Элемент управления в навигации, полях и баннерах.',
    axes: [
      {
        name: 'size',
        values: ['xsmall', 'small', 'medium', 'large'],
      },
      {
        name: 'type',
        values: ['accent', 'ghost'],
      },
      {
        name: 'color',
        values: ['primary', 'neutral'],
      },
      {
        name: 'radius',
        values: ['circle', 'squircle'],
      },
      {
        name: 'glass',
        values: ['false', 'frost', 'liquid'],
      },
    ],
    variants: [
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/1.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/2.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/3.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'frost',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/4.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'liquid',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/5.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'accent',
          color: 'neutral',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/6.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'ghost',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/7.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'xsmall',
          type: 'ghost',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/8.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/9.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/10.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/11.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'frost',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/12.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'liquid',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/13.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'accent',
          color: 'neutral',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/14.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'ghost',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/15.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'small',
          type: 'ghost',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/16.webp',
        w: 36,
        h: 36,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/17.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/18.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/19.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'frost',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/20.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'liquid',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/21.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'accent',
          color: 'neutral',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/22.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'ghost',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/23.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'medium',
          type: 'ghost',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/24.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/25.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/26.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/27.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'frost',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/28.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'neutral',
          radius: 'circle',
          glass: 'liquid',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/29.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'accent',
          color: 'neutral',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/30.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'ghost',
          color: 'primary',
          radius: 'circle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/31.webp',
        w: 52,
        h: 52,
      },
      {
        props: {
          size: 'large',
          type: 'ghost',
          color: 'primary',
          radius: 'squircle',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/icnbutton/32.webp',
        w: 52,
        h: 52,
      },
    ],
  },
  {
    id: 'quick-action',
    title: 'Quick action',
    desc: 'Быстрое действие на главной: перевод, QR, пополнение.',
    axes: [
      {
        name: 'type',
        values: ['primary', 'secondary'],
      },
    ],
    variants: [
      {
        props: {
          type: 'primary',
        },
        src: 'assets/cases/psb/kit/c/quick-action/1.webp',
        w: 64,
        h: 86,
      },
      {
        props: {
          type: 'secondary',
        },
        src: 'assets/cases/psb/kit/c/quick-action/2.webp',
        w: 64,
        h: 86,
      },
    ],
  },
  {
    id: 'shake-button',
    title: 'Shake button',
    desc: 'Кнопка выбора категорий: кадры анимации встряски.',
    axes: [
      {
        name: 'state',
        values: ['chikapaka', 'chikatana', 'chikatana2', 'chikapaka2', 'chikapaka3'],
      },
    ],
    variants: [
      {
        props: {
          state: 'chikapaka',
        },
        src: 'assets/cases/psb/kit/c/shake-button/1.webp',
        w: 402,
        h: 52,
      },
      {
        props: {
          state: 'chikatana',
        },
        src: 'assets/cases/psb/kit/c/shake-button/2.webp',
        w: 402,
        h: 52,
      },
      {
        props: {
          state: 'chikatana2',
        },
        src: 'assets/cases/psb/kit/c/shake-button/3.webp',
        w: 402,
        h: 52,
      },
      {
        props: {
          state: 'chikapaka2',
        },
        src: 'assets/cases/psb/kit/c/shake-button/4.webp',
        w: 402,
        h: 52,
      },
      {
        props: {
          state: 'chikapaka3',
        },
        src: 'assets/cases/psb/kit/c/shake-button/5.webp',
        w: 402,
        h: 52,
      },
    ],
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    desc: 'Позволяет выбрать один или несколько вариантов из списка.',
    axes: [
      {
        name: 'state',
        values: ['enabled', 'disabled'],
      },
    ],
    variants: [
      {
        props: {
          state: 'enabled',
        },
        src: 'assets/cases/psb/kit/c/checkbox/1.webp',
        w: 24,
        h: 24,
      },
      {
        props: {
          state: 'disabled',
        },
        src: 'assets/cases/psb/kit/c/checkbox/2.webp',
        w: 24,
        h: 24,
      },
    ],
  },
  {
    id: 'badge',
    title: 'Badge',
    desc: 'Показывает уведомления, счётчики и используется для навигации.',
    axes: [
      {
        name: 'type',
        values: ['primary', 'secondary'],
      },
      {
        name: 'glass',
        values: ['false', 'true'],
      },
    ],
    variants: [
      {
        props: {
          type: 'primary',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/badge/1.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'secondary',
          glass: 'false',
        },
        src: 'assets/cases/psb/kit/c/badge/2.webp',
        w: 87,
        h: 24,
      },
      {
        props: {
          type: 'secondary',
          glass: 'true',
        },
        src: 'assets/cases/psb/kit/c/badge/3.webp',
        w: 87,
        h: 24,
      },
    ],
  },
  {
    id: 'segmented-control',
    title: 'Segmented control',
    desc: 'Переключатель из двух вариантов.',
    axes: [
      {
        name: 'selected',
        values: ['first', 'last'],
      },
      {
        name: 'size',
        values: ['xsmall', 'small'],
      },
    ],
    variants: [
      {
        props: {
          selected: 'first',
          size: 'xsmall',
        },
        src: 'assets/cases/psb/kit/c/segmented-control/1.webp',
        w: 362,
        h: 32,
      },
      {
        props: {
          selected: 'first',
          size: 'small',
        },
        src: 'assets/cases/psb/kit/c/segmented-control/2.webp',
        w: 362,
        h: 44,
      },
      {
        props: {
          selected: 'last',
          size: 'small',
        },
        src: 'assets/cases/psb/kit/c/segmented-control/3.webp',
        w: 362,
        h: 44,
      },
      {
        props: {
          selected: 'last',
          size: 'xsmall',
        },
        src: 'assets/cases/psb/kit/c/segmented-control/4.webp',
        w: 362,
        h: 32,
      },
    ],
  },
  {
    id: 'cell',
    title: 'Cell',
    desc: 'Строка списка: пункт меню, операция в истории, выбор с чекбоксом.',
    axes: [
      {
        name: 'type',
        values: ['list', 'history', 'list_checkbox'],
      },
      {
        name: 'state',
        values: ['Default', 'Selected'],
      },
    ],
    variants: [
      {
        props: {
          type: 'list',
          state: 'Default',
        },
        src: 'assets/cases/psb/kit/c/cell/1.webp',
        w: 362,
        h: 52,
      },
      {
        props: {
          type: 'history',
          state: 'Default',
        },
        src: 'assets/cases/psb/kit/c/cell/2.webp',
        w: 362,
        h: 38,
      },
      {
        props: {
          type: 'list_checkbox',
          state: 'Default',
        },
        src: 'assets/cases/psb/kit/c/cell/3.webp',
        w: 362,
        h: 62,
      },
      {
        props: {
          type: 'list_checkbox',
          state: 'Selected',
        },
        src: 'assets/cases/psb/kit/c/cell/4.webp',
        w: 362,
        h: 62,
      },
    ],
  },
  {
    id: 'banner',
    title: 'Banner',
    desc: 'Баннеры на главной: новость, новый продукт, действие, подсказка.',
    axes: [
      {
        name: 'type',
        values: ['news', 'newProduct', 'action', 'Info'],
      },
    ],
    variants: [
      {
        props: {
          type: 'news',
        },
        src: 'assets/cases/psb/kit/c/banner/1.webp',
        w: 272,
        h: 88,
      },
      {
        props: {
          type: 'newProduct',
        },
        src: 'assets/cases/psb/kit/c/banner/2.webp',
        w: 272,
        h: 88,
      },
      {
        props: {
          type: 'action',
        },
        src: 'assets/cases/psb/kit/c/banner/3.webp',
        w: 330,
        h: 88,
      },
      {
        props: {
          type: 'Info',
        },
        src: 'assets/cases/psb/kit/c/banner/4.webp',
        w: 330,
        h: 96,
      },
    ],
  },
  {
    id: 'block',
    title: 'Block',
    desc: 'Блок главной с заголовком: раскрыт, свёрнут, с графиком.',
    axes: [
      {
        name: 'state',
        values: ['opened', 'closed'],
      },
      {
        name: 'type',
        values: ['block', 'chart'],
      },
    ],
    variants: [
      {
        props: {
          state: 'opened',
          type: 'block',
        },
        src: 'assets/cases/psb/kit/c/block/1.webp',
        w: 402,
        h: 152,
      },
      {
        props: {
          state: 'closed',
          type: 'block',
        },
        src: 'assets/cases/psb/kit/c/block/2.webp',
        w: 402,
        h: 68,
      },
      {
        props: {
          state: 'closed',
          type: 'chart',
        },
        src: 'assets/cases/psb/kit/c/block/3.webp',
        w: 402,
        h: 168,
      },
    ],
  },
  {
    id: 'block-chart',
    title: 'Block chart',
    desc: 'Траты за месяц или за год.',
    axes: [
      {
        name: 'state',
        values: ['mouth', 'year'],
      },
    ],
    variants: [
      {
        props: {
          state: 'mouth',
        },
        src: 'assets/cases/psb/kit/c/block-chart/1.webp',
        w: 402,
        h: 184,
      },
      {
        props: {
          state: 'year',
        },
        src: 'assets/cases/psb/kit/c/block-chart/2.webp',
        w: 402,
        h: 324,
      },
    ],
  },
  {
    id: 'card-account',
    title: 'Card account',
    desc: 'Плитка счёта на главной и плитка нового продукта.',
    axes: [
      {
        name: 'type',
        values: ['account', 'newProduct'],
      },
    ],
    variants: [
      {
        props: {
          type: 'account',
        },
        src: 'assets/cases/psb/kit/c/card-account/1.webp',
        w: 204,
        h: 150,
      },
      {
        props: {
          type: 'newProduct',
        },
        src: 'assets/cases/psb/kit/c/card-account/2.webp',
        w: 160,
        h: 150,
      },
    ],
  },
  {
    id: 'card',
    title: 'Card',
    desc: 'Карта: лицо и оборот с реквизитами.',
    axes: [
      {
        name: 'side',
        values: ['front', 'back'],
      },
      {
        name: 'type',
        values: ['night', 'orange'],
      },
    ],
    variants: [
      {
        props: {
          side: 'front',
          type: 'night',
        },
        src: 'assets/cases/psb/kit/c/card/1.webp',
        w: 320,
        h: 213,
      },
      {
        props: {
          side: 'front',
          type: 'orange',
        },
        src: 'assets/cases/psb/kit/c/card/2.webp',
        w: 320,
        h: 213,
      },
      {
        props: {
          side: 'back',
          type: 'night',
        },
        src: 'assets/cases/psb/kit/c/card/3.webp',
        w: 320,
        h: 213,
      },
      {
        props: {
          side: 'back',
          type: 'orange',
        },
        src: 'assets/cases/psb/kit/c/card/4.webp',
        w: 320,
        h: 213,
      },
    ],
  },
  {
    id: 'card-selection',
    title: 'Card selection',
    desc: 'Выбор карты в счёте: соседняя выглядывает сбоку.',
    axes: [
      {
        name: 'property 1',
        values: ['Default', 'Variant2'],
      },
    ],
    variants: [
      {
        props: {
          'property 1': 'Default',
        },
        src: 'assets/cases/psb/kit/c/card-selection/1.webp',
        w: 402,
        h: 213,
      },
      {
        props: {
          'property 1': 'Variant2',
        },
        src: 'assets/cases/psb/kit/c/card-selection/2.webp',
        w: 402,
        h: 213,
      },
    ],
  },
  {
    id: 'header',
    title: 'Header',
    desc: 'Шапка экрана: главная с профилем или внутренняя с заголовком.',
    axes: [
      {
        name: 'type',
        values: ['main', 'title'],
      },
    ],
    variants: [
      {
        props: {
          type: 'main',
        },
        src: 'assets/cases/psb/kit/c/header/1.webp',
        w: 402,
        h: 115,
      },
      {
        props: {
          type: 'title',
        },
        src: 'assets/cases/psb/kit/c/header/2.webp',
        w: 402,
        h: 115,
      },
    ],
  },
  {
    id: 'tabbar',
    title: 'Tabbar',
    desc: 'Навигация внизу экрана для быстрого переключения разделов.',
    axes: [
      {
        name: 'selected',
        values: ['1', '2', '3', '4', '5'],
      },
    ],
    variants: [
      {
        props: {
          selected: '1',
        },
        src: 'assets/cases/psb/kit/c/tabbar/1.webp',
        w: 402,
        h: 99,
      },
      {
        props: {
          selected: '2',
        },
        src: 'assets/cases/psb/kit/c/tabbar/2.webp',
        w: 402,
        h: 99,
      },
      {
        props: {
          selected: '3',
        },
        src: 'assets/cases/psb/kit/c/tabbar/3.webp',
        w: 402,
        h: 99,
      },
      {
        props: {
          selected: '4',
        },
        src: 'assets/cases/psb/kit/c/tabbar/4.webp',
        w: 402,
        h: 99,
      },
      {
        props: {
          selected: '5',
        },
        src: 'assets/cases/psb/kit/c/tabbar/5.webp',
        w: 402,
        h: 99,
      },
    ],
  },
  {
    id: 'tabbar-button',
    title: 'Tabbar button',
    desc: 'Кнопка таббара: обычная и выбранная.',
    axes: [
      {
        name: 'state',
        values: ['Unselected', 'Selected'],
      },
    ],
    variants: [
      {
        props: {
          state: 'Unselected',
        },
        src: 'assets/cases/psb/kit/c/tabbar-button/1.webp',
        w: 44,
        h: 44,
      },
      {
        props: {
          state: 'Selected',
        },
        src: 'assets/cases/psb/kit/c/tabbar-button/2.webp',
        w: 44,
        h: 44,
      },
    ],
  },
  {
    id: 'bottom-sheet',
    title: 'Bottom sheet',
    desc: 'Появление bottom sheet.',
    axes: [
      {
        name: 'state',
        values: ['closed', 'opened'],
      },
    ],
    variants: [
      {
        props: {
          state: 'closed',
        },
        src: 'assets/cases/psb/kit/c/bottom-sheet/1.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          state: 'opened',
        },
        src: 'assets/cases/psb/kit/c/bottom-sheet/2.webp',
        w: 402,
        h: 874,
      },
    ],
  },
  {
    id: 'bg-animation',
    title: 'Bg animation',
    desc: 'Анимированный blob на фоне.',
    axes: [
      {
        name: 'frame',
        values: ['1', '2', '3', '4', '5', '6'],
      },
    ],
    variants: [
      {
        props: {
          frame: '1',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/1.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          frame: '2',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/2.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          frame: '3',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/3.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          frame: '4',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/4.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          frame: '5',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/5.webp',
        w: 402,
        h: 874,
      },
      {
        props: {
          frame: '6',
        },
        src: 'assets/cases/psb/kit/c/bg-animation/6.webp',
        w: 402,
        h: 874,
      },
    ],
  },
];
