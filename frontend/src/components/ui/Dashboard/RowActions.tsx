import { Link } from 'react-router-dom';

const ACTION = 'hover:underline focus-visible:outline focus-visible:outline-2';

type RowActionsProps = {
  name: string;
  viewTo: string;
  editTo: string;
  deleteTo?: string;
};

export default function RowActions({ name, viewTo, editTo, deleteTo }: RowActionsProps) {
  return (
    <div className="flex flex-wrap gap-6">
      <Link className={`${ACTION} text-cyan`} to={viewTo} aria-label={`View ${name}`}>
        View
      </Link>
      <Link className={`${ACTION} text-gold`} to={editTo} aria-label={`Edit ${name}`}>
        Edit
      </Link>
      {deleteTo && (
        <Link className={`${ACTION} text-crimson`} to={deleteTo} aria-label={`Delete ${name}`}>
          Delete
        </Link>
      )}
    </div>
  );
}
