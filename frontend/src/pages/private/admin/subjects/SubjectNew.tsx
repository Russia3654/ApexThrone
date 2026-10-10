import { useNavigate } from 'react-router-dom';
import SubjectForm from '../../../../components/ui/Forms/SubjectForm';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import { POSITION_OPTIONS } from '../../../../utils/positionOptions';

const SubjectNew = () => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/admin/subjects');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Subject"
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
      />
      <SubjectForm
        submitLabel="Create Subject"
        options={POSITION_OPTIONS}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default SubjectNew;
