import { Fragment } from 'react';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';
import PageRow from '../../../../components/ui/Dashboard/PageRow';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import { useAdminPages } from '../../../../hooks/useAdminPages';

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
        <div className="overflow-x-auto border border-surface-2">
          <table aria-label="Pages" className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-2">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.groups.map(({ core, subpages }) => (
                <Fragment key={core.id}>
                  <PageRow page={core} />
                  {subpages.map((page) => (
                    <PageRow key={page.id} page={page} />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
