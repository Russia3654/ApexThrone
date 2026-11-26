import { AdminPage, AdminPageResponse, AdminPagesResponse, PageInput } from '../types/api';
import { apiGet, apiPost } from './client';

export async function listPages(): Promise<AdminPage[]> {
  const { pages } = await apiGet<AdminPagesResponse>('/admin/pages');
  return pages;
}

export async function getAdminPage(id: number): Promise<AdminPage> {
  const { page } = await apiGet<AdminPageResponse>(`/admin/page?id=${id}`);
  return page;
}

export async function createPage(input: PageInput): Promise<AdminPage> {
  const { page } = await apiPost<AdminPageResponse>('/admin/pages', input);
  return page;
}

export async function updatePage(id: number, input: PageInput): Promise<AdminPage> {
  const { page } = await apiPost<AdminPageResponse>(`/admin/page/update?id=${id}`, input);
  return page;
}

export async function deletePage(id: number): Promise<void> {
  await apiPost(`/admin/page/delete?id=${id}`);
}
