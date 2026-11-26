import { AdminPage, PageInput } from '../types/api';
import { PageFormValues } from '../types/forms';

export const EMPTY_PAGE_VALUES: PageFormValues = {
  parent_ID: '',
  menu_name: '',
  slug: '',
  position: '1',
  visible: false,
  status: 'draft',
  max_element: '10',
};

export function toPageValues(page: AdminPage): PageFormValues {
  return {
    parent_ID: page.parent_ID === null ? '' : String(page.parent_ID),
    menu_name: page.menu_name,
    slug: page.slug,
    position: String(page.position),
    visible: page.visible,
    status: page.status,
    max_element: String(page.max_element),
  };
}

export function toPageInput(values: PageFormValues): PageInput {
  return {
    parent_ID: values.parent_ID === '' ? null : Number(values.parent_ID),
    menu_name: values.menu_name,
    slug: values.slug,
    position: Number(values.position),
    visible: values.visible ? 1 : 0,
    status: values.status,
    max_element: Number(values.max_element),
  };
}
