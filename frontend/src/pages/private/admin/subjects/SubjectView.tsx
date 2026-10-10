import { useParams } from 'react-router-dom';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';

const SubjectView = () => {
  const { id } = useParams();

  if (!id) {
    return <p>no such ID</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject: 'name'"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
        actions={
          <div className="flex gap-4">
            <LinkButton to={`/admin/subjects/SubjectEdit/${id}`}>Edit</LinkButton>
            <LinkButton to={`/admin/subjects/SubjectDelete/${id}`} variant="danger">
              Delete
            </LinkButton>
          </div>
        }
      />
      <dl className="grid grid-cols-[8rem_1fr] gap-x-6 gap-y-3 border border-surface-2 bg-surface p-6">
        <dt className="font-display uppercase tracking-wider text-ink-muted">Name:</dt>
        <dd className="text-ink">"name"</dd>
        <dt className="font-display uppercase tracking-wider text-ink-muted">Visibility:</dt>
        <dd className="text-ink">"visibility"</dd>
        <dt className="font-display uppercase tracking-wider text-ink-muted">Position:</dt>
        <dd className="text-ink">"position"</dd>
      </dl>
    </div>
  );
};

export default SubjectView;
