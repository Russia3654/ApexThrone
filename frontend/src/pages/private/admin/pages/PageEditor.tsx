import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import PageForm from '../../../../components/ui/Forms/PageForm';
import { usePageForm } from '../../../../hooks/usePageForm';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageId = id === undefined ? null : Number(id);
  const { load, values, error, saving, handleChange, handleSubmit } = usePageForm(pageId, () =>
    navigate('/admin/pages'),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageId === null ? 'Add Subpage' : 'Edit Page'}
        backLink={{ to: '/admin/pages', label: 'Back to Pages' }}
      />
      {load.status === 'loading' && <p role="status">Loading...</p>}
      {load.status === 'error' && (
        <p role="alert" className="text-crimson">
          {load.message}
        </p>
      )}
      {load.status === 'ready' && (
        <PageForm
          values={values}
          corePages={load.corePages}
          isCore={load.isCore}
          error={error}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
