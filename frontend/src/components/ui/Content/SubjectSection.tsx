import { PublicSubject } from '../../../types/api';

type SubjectSectionProps = {
  subject: PublicSubject;
};

export default function SubjectSection({ subject }: SubjectSectionProps) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold uppercase tracking-wider">
        {subject.menu_name}
      </h2>
      <p className="mt-2 whitespace-pre-line text-ink-muted">{subject.content}</p>
    </section>
  );
}
