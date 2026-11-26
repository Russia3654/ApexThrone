export type MenuItem = {
  menu_name: string;
  slug: string;
};

export type PublicSubject = {
  id: number;
  menu_name: string;
  content: string;
};

export type PublicPage = {
  menu_name: string;
  slug: string;
  subjects: PublicSubject[];
  subpages: MenuItem[];
};

export type MenuResponse = { menu: MenuItem[] };
export type PageResponse = { page: PublicPage };
