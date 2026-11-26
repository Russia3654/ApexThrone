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

export type Admin = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
};

export type AdminResponse = { admin: Admin };

export type Credentials = {
  username: string;
  password: string;
};

export type PageStatus = 'draft' | 'published' | 'archived';

export type AdminPage = {
  id: number;
  parent_ID: number | null;
  menu_name: string;
  slug: string;
  position: number;
  visible: boolean;
  status: PageStatus;
  max_element: number;
  created_at: string;
  updated_at: string;
};

// what we send: PHP wants visible as 1 or 0
export type PageInput = {
  parent_ID: number | null;
  menu_name: string;
  slug: string;
  position: number;
  visible: 0 | 1;
  status: PageStatus;
  max_element: number;
};

export type AdminPagesResponse = { pages: AdminPage[] };
export type AdminPageResponse = { page: AdminPage };
