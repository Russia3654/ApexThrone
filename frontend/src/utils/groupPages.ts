import { AdminPage } from '../types/api';

export type PageGroup = { core: AdminPage; subpages: AdminPage[] };

export function groupPages(pages: AdminPage[]): PageGroup[] {
  return pages
    .filter((page) => page.parent_ID === null)
    .map((core) => ({ core, subpages: pages.filter((page) => page.parent_ID === core.id) }));
}
