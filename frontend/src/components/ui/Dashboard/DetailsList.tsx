import { Fragment } from 'react';

type DetailsListProps = {
  rows: [string, string | number][];
};

export default function DetailsList({ rows }: DetailsListProps) {
  return (
    <dl className="grid max-w-md grid-cols-2 gap-2">
      {rows.map(([term, value]) => (
        <Fragment key={term}>
          <dt className="text-ink-muted">{term}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
