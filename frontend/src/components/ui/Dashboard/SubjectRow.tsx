import { SubjectListItem } from '../../../types/ui';
import RowActions from './RowActions';

const CELL = 'px-4 py-3';

export default function SubjectRow({ item }: { item: SubjectListItem }) {
  const { subject, pageName } = item;

  return (
    <tr className="border-t border-surface-2 hover:bg-surface">
      <th scope="row" className={`${CELL} font-normal`}>
        {subject.menu_name}
      </th>
      <td className={CELL}>{pageName}</td>
      <td className={CELL}>{subject.position}</td>
      <td className={CELL}>{subject.visible ? 'Yes' : 'No'}</td>
      <td className={CELL}>{subject.status}</td>
      <td className={CELL}>
        <RowActions
          name={subject.menu_name}
          viewTo={`/admin/subjects/SubjectView/${subject.id}`}
          editTo={`/admin/subjects/SubjectEdit/${subject.id}`}
          deleteTo={`/admin/subjects/SubjectDelete/${subject.id}`}
        />
      </td>
    </tr>
  );
}
