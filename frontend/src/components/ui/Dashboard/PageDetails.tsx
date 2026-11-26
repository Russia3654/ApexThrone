import { AdminPage } from '../../../types/api';
import DetailsList from './DetailsList';

export default function PageDetails({ page }: { page: AdminPage }) {
  return (
    <DetailsList
      rows={[
        ['Name', page.menu_name],
        ['Slug', page.slug],
        ['Type', page.parent_ID === null ? 'Core' : 'Subpage'],
        ['Position', page.position],
        ['Visible', page.visible ? 'Yes' : 'No'],
        ['Status', page.status],
        ['Maximum subjects', page.max_element],
      ]}
    />
  );
}
