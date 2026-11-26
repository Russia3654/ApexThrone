import { useParams } from 'react-router-dom';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import SubjectDetails from '../../../../components/ui/Dashboard/SubjectDetails';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import { useAdminSubject } from '../../../../hooks/useAdminSubject';

const SubjectView = () => {
  const { id } = useParams();
  const state = useAdminSubject(Number(id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="View Subject"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
        actions={
          state.status === 'ready' && (
            <div className="flex gap-4">
              <LinkButton to={`/admin/subjects/SubjectEdit/${id}`}>Edit</LinkButton>
              <LinkButton to={`/admin/subjects/SubjectDelete/${id}`} variant="danger">
                Delete
              </LinkButton>
            </div>
          )
        }
      />
      {state.status === 'loading' && <p role="status">Loading...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && <SubjectDetails item={state.item} />}
    </div>
  );
};

export default SubjectView;
