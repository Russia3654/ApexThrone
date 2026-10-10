import { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Buttons/Button';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';

const SubjectDelete = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  if (!id) return <p>no such ID</p>;

  const handleDelete = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/admin/subjects');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delete Subject"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
      />
      <form onSubmit={handleDelete} className="space-y-4">
        <p className="text-ink">Are you sure that you want to delete this subject?</p>
        <div className="border border-surface-2 bg-surface p-4 font-display text-xl text-gold">
          "subject name"
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="danger">
            Delete Subject
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubjectDelete;
