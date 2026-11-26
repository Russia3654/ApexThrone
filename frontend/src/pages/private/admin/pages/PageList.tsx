import { Fragment } from 'react';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import PageRow from '../../../../components/ui/Dashboard/PageRow';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import { useAdminPages } from '../../../../hooks/useAdminPages';
import DataTable from '../../../../components/ui/Dashboard/DataTable';

const COLUMNS = ['Name', 'Type', 'Position', 'Visible', 'Status', 'Actions'];

export default function PageList() {
  const state = useAdminPages();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        backLink={{ to: '/admin', label: 'Back to Admin Menu' }}
        actions={<LinkButton to="/admin/pages/new">Add Subpage</LinkButton>}
      />
      {state.status === 'loading' && <p role="status">Loading pages...</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-crimson">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && state.groups.length === 0 && <p>No pages found.</p>}
      {state.status === 'ready' && state.groups.length > 0 && (
        <DataTable label="Pages" columns={COLUMNS}>
          {state.groups.map(({ core, subpages }) => (
            <Fragment key={core.id}>
              <PageRow page={core} />
              {subpages.map((page) => (
                <PageRow key={page.id} page={page} />
              ))}
            </Fragment>
          ))}
        </DataTable>
      )}
    </div>
  );
}
