import RowActions from './RowActions';
import { AdminPage } from '../../../types/api';

const CELL = 'px-4 py-3';
const ACTION = 'hover:underline focus-visible:outline focus-visible:outline-2';

export default function PageRow({ page }: { page: AdminPage }) {
  const isCore = page.parent_ID === null;
  const base = `/admin/pages/${page.id}`;

  return (
    <tr className="border-t border-surface-2 hover:bg-surface">
      <th scope="row" className={`${CELL} font-normal ${isCore ? '' : 'pl-10 text-ink-muted'}`}>
        {page.menu_name}
      </th>
      <td className={CELL}>{isCore ? 'Core' : 'Subpage'}</td>
      <td className={CELL}>{page.position}</td>
      <td className={CELL}>{page.visible ? 'Yes' : 'No'}</td>
      <td className={CELL}>{page.status}</td>
      <td className={CELL}>
        <RowActions
          name={page.menu_name}
          viewTo={base}
          editTo={`${base}/edit`}
          deleteTo={isCore ? undefined : `${base}/delete`}
        />
      </td>
    </tr>
  );
}
