import { useNavigate, useParams } from 'react-router-dom';
import { deleteSubject } from '../../../../api/adminSubjectsApi';
import Button from '../../../../components/ui/Buttons/Button';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import SubjectDetails from '../../../../components/ui/Dashboard/SubjectDetails';
import { useAdminSubject } from '../../../../hooks/useAdminSubject';
import { useDeleteAction } from '../../../../hooks/useDeleteAction';

const SubjectDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAdminSubject(Number(id));
  const { deleting, error, handleDelete } = useDeleteAction(
    () => deleteSubject(Number(id)),
    () => navigate('/admin/subjects'),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delete Subject"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
      />
      {state.status === 'loading' && <p role="status">Loading...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && (
        <>
          <SubjectDetails item={state.item} />
          <p>Are you sure that you want to delete this subject? This cannot be undone.</p>
          {error && (
            <p role="alert" className="text-crimson">
              {error}
            </p>
          )}
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Subject'}
          </Button>
        </>
      )}
    </div>
  );
};

export default SubjectDelete;
