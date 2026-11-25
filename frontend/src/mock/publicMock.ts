import { PublicPage } from '../types/api';

export const mockPages: PublicPage[] = [
  {
    menu_name: 'About',
    slug: 'about',
    subjects: [{ id: 1, menu_name: 'Who we are', content: 'A university esports community.' }],
  },
  { menu_name: 'Rules & FAQ', slug: 'rules', subjects: [] },
];
