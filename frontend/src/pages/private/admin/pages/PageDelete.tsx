import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Buttons/Button';
import PageDetails from '../../../../components/ui/Dashboard/PageDetails';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import { useAdminPage } from '../../../../hooks/useAdminPage';
import { deletePage } from '../../../../api/adminPagesApi';
import { useDeleteAction } from '../../../../hooks/useDeleteAction';

export default function PageDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAdminPage(Number(id));
  const { deleting, error, handleDelete } = useDeleteAction(
    () => deletePage(Number(id)),
    () => navigate('/admin/pages'),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Delete Page" backLink={{ to: '/admin/pages', label: 'Back to Pages' }} />
      {state.status === 'loading' && <p role="status">Loading...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && (
        <>
          <PageDetails page={state.page} />
          {state.page.parent_ID === null ? (
            <p>Core pages cannot be deleted.</p>
          ) : (
            <>
              <p>Deleting this page also deletes all of its subjects. This cannot be undone.</p>
              {error && (
                <p role="alert" className="text-crimson">
                  {error}
                </p>
              )}
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete page'}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
