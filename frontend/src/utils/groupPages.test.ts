import { AdminPage } from '../types/api';
import { groupPages } from './groupPages';

function page(id: number, parent_ID: number | null): AdminPage {
  return {
    id,
    parent_ID,
    menu_name: `Page ${id}`,
    slug: `page-${id}`,
    position: 1,
    visible: true,
    status: 'published',
    max_element: 10,
    created_at: '2026-11-26 10:00:00',
    updated_at: '2026-11-26 10:00:00',
  };
}

test('puts each subpage under its own core page', () => {
  const groups = groupPages([page(1, null), page(3, 2), page(2, null), page(4, 1)]);

  expect(groups).toEqual([
    { core: page(1, null), subpages: [page(4, 1)] },
    { core: page(2, null), subpages: [page(3, 2)] },
  ]);
});

test('keeps the order the server sent, for core pages and subpages', () => {
  const groups = groupPages([page(2, null), page(1, null), page(6, 2), page(5, 2)]);

  expect(groups.map((group) => group.core.id)).toEqual([2, 1]);
  expect(groups[0].subpages.map((item) => item.id)).toEqual([6, 5]);
});

test('handles a core page without subpages, and an empty list', () => {
  expect(groupPages([page(1, null)])).toEqual([{ core: page(1, null), subpages: [] }]);
  expect(groupPages([])).toEqual([]);
});
