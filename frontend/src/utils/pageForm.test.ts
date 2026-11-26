import { AdminPage } from '../types/api';
import { EMPTY_PAGE_VALUES, toPageInput, toPageValues } from './pageForm';

const corePage: AdminPage = {
  id: 2,
  parent_ID: null,
  menu_name: 'About',
  slug: 'about',
  position: 2,
  visible: true,
  status: 'published',
  max_element: 10,
  created_at: '2026-11-26 10:00:00',
  updated_at: '2026-11-26 10:00:00',
};

test('a page becomes form values: numbers as text, no parent as an empty string', () => {
  expect(toPageValues(corePage)).toEqual({
    parent_ID: '',
    menu_name: 'About',
    slug: 'about',
    position: '2',
    visible: true,
    status: 'published',
    max_element: '10',
  });
});

test('form values go back to the types PHP expects', () => {
  expect(toPageInput(toPageValues(corePage))).toEqual({
    parent_ID: null,
    menu_name: 'About',
    slug: 'about',
    position: 2,
    visible: 1,
    status: 'published',
    max_element: 10,
  });
});

test('a chosen parent becomes a number and an unchecked box becomes 0', () => {
  const input = toPageInput({ ...EMPTY_PAGE_VALUES, parent_ID: '7', visible: false });

  expect(input.parent_ID).toBe(7);
  expect(input.visible).toBe(0);
});
