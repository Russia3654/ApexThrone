import { Link } from 'react-router-dom';
import LinkButton from '../../../../components/ui/Links/LinkButton';
import PageHeader from '../../../../components/ui/Dashboard/PageHeader';

const SubjectList = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        backLink={{ to: '/admin', label: 'Back to Admin Menu' }}
        actions={<LinkButton to="/admin/subjects/SubjectNew">Add Subject</LinkButton>}
      />
      <div className="overflow-x-auto border border-surface-2">
        <table aria-label="Subjects Table" className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-2">
              <th
                className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                scope="col"
              >
                ID
              </th>
              <th
                className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                scope="col"
              >
                Position
              </th>
              <th
                className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                scope="col"
              >
                Visible
              </th>
              <th
                className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                scope="col"
              >
                Name
              </th>
              <th
                className="px-4 py-3 font-display text-sm uppercase tracking-wider text-gold"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-surface-2 hover:bg-surface">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">true</td>
              <td className="px-4 py-3">Subject 1</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-6">
                  <Link
                    className="text-cyan hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
                    to="/admin/subjects/SubjectView/1"
                  >
                    View
                  </Link>
                  <Link
                    className="text-gold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                    to="/admin/subjects/SubjectEdit/1"
                  >
                    Edit
                  </Link>
                  <Link
                    className="text-crimson hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson"
                    to="/admin/subjects/SubjectDelete/1"
                  >
                    Delete
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectList;
