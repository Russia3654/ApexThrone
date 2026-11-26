import { useParams } from 'react-router-dom';
import PageDetails from '../../../../components/ui/Dashboard/PageDetails';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import { useAdminPage } from '../../../../hooks/useAdminPage';

export default function PageView() {
  const { id } = useParams();
  const state = useAdminPage(Number(id));

  return (
    <div className="space-y-6">
      <PageHeader title="View Page" backLink={{ to: '/admin/pages', label: 'Back to Pages' }} />
      {state.status === 'loading' && <p role="status">Loading...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && <PageDetails page={state.page} />}
    </div>
  );
}
