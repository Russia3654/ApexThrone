import { Link, useParams } from 'react-router-dom';
import BackLink from '../../../../components/ui/BackLink';
import LinkButton from '../../../../components/ui/LinkButton';

const SubjectView = () => {
  const { id } = useParams();

  if (!id) {
    return <p>no such ID</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <BackLink to="/admin/subjects">Back to Subject List</BackLink>
        <div className="flex flex-col items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-gold">Subject: "name"</h1>
          <div className="flex gap-4">
            <LinkButton to={`/admin/subjects/SubjectEdit/${id}`}>Edit</LinkButton>
            <LinkButton to={`/admin/subjects/SubjectDelete/${id}`} variant="danger">
              Delete
            </LinkButton>
          </div>
        </div>
      </header>
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
