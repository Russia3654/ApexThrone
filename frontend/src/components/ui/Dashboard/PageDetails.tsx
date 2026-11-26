import { Fragment } from 'react';
import { AdminPage } from '../../../types/api';

export default function PageDetails({ page }: { page: AdminPage }) {
  const rows = [
    ['Name', page.menu_name],
    ['Slug', page.slug],
    ['Type', page.parent_ID === null ? 'Core' : 'Subpage'],
    ['Position', page.position],
    ['Visible', page.visible ? 'Yes' : 'No'],
    ['Status', page.status],
    ['Maximum subjects', page.max_element],
  ];

  return (
    <dl className="grid max-w-md grid-cols-2 gap-2">
      {rows.map(([term, value]) => (
        <Fragment key={term}>
          <dt className="text-ink-muted">{term}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
