import DataTable from '../../../../components/ui/Dashboard/DataTable';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import SubjectRow from '../../../../components/ui/Dashboard/SubjectRow';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import { useAdminSubjects } from '../../../../hooks/useAdminSubjects';

const COLUMNS = ['Name', 'Page', 'Position', 'Visible', 'Status', 'Actions'];

const SubjectList = () => {
  const state = useAdminSubjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        backLink={{ to: '/admin', label: 'Back to Admin Menu' }}
        actions={<LinkButton to="/admin/subjects/SubjectNew">Add Subject</LinkButton>}
      />
      {state.status === 'loading' && <p role="status">Loading subjects...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && state.items.length === 0 && <p>No subjects yet.</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <DataTable label="Subjects" columns={COLUMNS}>
          {state.items.map((item) => (
            <SubjectRow key={item.subject.id} item={item} />
          ))}
        </DataTable>
      )}
    </div>
  );
};

export default SubjectList;
