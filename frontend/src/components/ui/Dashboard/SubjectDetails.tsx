import { SubjectListItem } from '../../../types/ui';
import DetailsList from './DetailsList';

export default function SubjectDetails({ item }: { item: SubjectListItem }) {
  const { subject, pageName } = item;

  return (
    <div className="space-y-4">
      <DetailsList
        rows={[
          ['Name', subject.menu_name],
          ['Page', pageName],
          ['Position', subject.position],
          ['Visible', subject.visible ? 'Yes' : 'No'],
          ['Status', subject.status],
        ]}
      />
      <section>
        <h2 className="text-ink-muted">Content</h2>
        <p className="whitespace-pre-line">{subject.content || 'No content.'}</p>
      </section>
    </div>
  );
}
