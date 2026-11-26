import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import SubjectForm from '../../../../components/ui/Forms/SubjectForm';
import { useSubjectForm } from '../../../../hooks/useSubjectForm';

export default function SubjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subjectId = id === undefined ? null : Number(id);
  const { load, values, error, saving, handleChange, handleSubmit } = useSubjectForm(
    subjectId,
    () => navigate('/admin/subjects'),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={subjectId === null ? 'Create Subject' : 'Update Subject'}
        backLink={{ to: '/admin/subjects', label: 'Back to Subject List' }}
      />
      {load.status === 'loading' && <p role="status">Loading...</p>}
      {load.status === 'error' && (
        <p role="alert" className="text-crimson">
          {load.message}
        </p>
      )}
      {load.status === 'ready' && (
        <SubjectForm
          values={values}
          pageOptions={load.pageOptions}
          error={error}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
