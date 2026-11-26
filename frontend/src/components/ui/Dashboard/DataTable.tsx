import { ReactNode } from 'react';

type DataTableProps = {
  label: string;
  columns: string[];
  children: ReactNode;
};

export default function DataTable({ label, columns, children }: DataTableProps) {
  return (
    <div className="overflow-x-auto border border-surface-2">
      <table aria-label={label} className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((column) => (
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
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
