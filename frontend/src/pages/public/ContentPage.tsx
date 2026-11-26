import { useParams } from 'react-router-dom';
import SubjectSection from '../../components/ui/Content/SubjectSection';
import SubpageList from '../../components/ui/Content/SubpageList';
import { usePage } from '../../hooks/usePage';
import NotFound from './NotFound';

export default function ContentPage() {
  const { slug = '' } = useParams();
  const result = usePage(slug);

  if (result.status === 'loading') {
    return (
      <p role="status" className="text-ink-muted">
        Loading page...
      </p>
    );
  }
  if (result.status === 'notFound') {
    return <NotFound />;
  }
  if (result.status === 'error') {
    return (
      <p role="alert" className="text-crimson">
        The page could not be loaded. Please reload.
      </p>
    );
  }

  const { page } = result;
  const isEmpty = page.subjects.length === 0 && page.subpages.length === 0;

  return (
    <article className="space-y-8">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-gold">
        {page.menu_name}
      </h1>
      {page.subpages.length > 0 && <SubpageList subpages={page.subpages} />}
      {page.subjects.map((subject) => (
        <SubjectSection key={subject.id} subject={subject} />
      ))}
      {isEmpty && <p className="text-ink-muted">This page has no content yet.</p>}
    </article>
  );
}
