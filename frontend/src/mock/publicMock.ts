import { MenuItem, PublicPage } from '../types/api';

export const mockMenu: MenuItem[] = [
  { menu_name: 'Rules & FAQ', slug: 'rules' },
  { menu_name: 'About', slug: 'about' },
];

export const mockPages: PublicPage[] = [
  {
    menu_name: 'About',
    slug: 'about',
    subjects: [{ id: 1, menu_name: 'Who we are', content: 'A university esports community.' }],
    subpages: [{ menu_name: 'Our history', slug: 'history' }],
  },
  { menu_name: 'Rules & FAQ', slug: 'rules', subjects: [], subpages: [] },
  { menu_name: 'Our history', slug: 'history', subjects: [], subpages: [] },
];
