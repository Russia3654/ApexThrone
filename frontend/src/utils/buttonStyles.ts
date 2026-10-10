import type { ButtonVariant } from '../types/ui';

export const BASE =
  'inline-block cut-corners px-4 py-2 font-display font-bold uppercase tracking-wider text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan';

export const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gold hover:shadow-glow-gold',
  danger: 'bg-crimson hover:shadow-glow-red',
};
