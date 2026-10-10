import { useNavigate, useParams } from 'react-router-dom';
import SubjectForm from '../../../../components/ui/Forms/SubjectForm';
import PageHeader from '../../../../components/ui/PageHeader';
import { POSITION_OPTIONS } from '../../../../utils/positionOptions';

const SubjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  if (!id) return <p>no such ID</p>;

  const handleModification = () => {
    navigate('/admin/subjects');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Update Subject"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
      />
      <SubjectForm
        submitLabel="Update Subject"
        options={POSITION_OPTIONS}
        onSubmit={handleModification}
      />
    </div>
  );
};

export default SubjectEdit;
