import { mockMenu, mockPages } from '../mock/publicMock';
import { MenuItem, MenuResponse, PageResponse, PublicPage } from '../types/api';
import { ApiError, apiGet } from './client';
import { USE_MOCK } from './config';

export async function getMenu(): Promise<MenuItem[]> {
  if (USE_MOCK) {
    return mockMenu;
  }
  const { menu } = await apiGet<MenuResponse>('/menu');
  return menu;
}

export async function getPage(slug: string): Promise<PublicPage> {
  if (USE_MOCK) {
    const found = mockPages.find((item) => item.slug === slug);
    if (!found) {
      throw new ApiError('Page not found', 404);
    }
    return found;
  }
  const { page } = await apiGet<PageResponse>(`/page?slug=${encodeURIComponent(slug)}`);
  return page;
}
