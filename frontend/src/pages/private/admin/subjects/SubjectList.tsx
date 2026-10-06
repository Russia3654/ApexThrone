import { Link } from 'react-router-dom';

const SubjectList = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <Link
          className="inline-block text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          to="/admin"
        >
          Back to Admin Menu
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gold">Subjects</h1>
          <Link
            className="cut-corners bg-gold px-4 py-2 font-display font-bold uppercase tracking-wider text-bg hover:shadow-glow-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            to="/admin/subjects/SubjectNew"
          >
            Add Subject
          </Link>
        </div>
      </header>
      <main className="overflow-x-auto border border-surface-2">
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
      </main>
    </div>
  );
};

export default SubjectList;
