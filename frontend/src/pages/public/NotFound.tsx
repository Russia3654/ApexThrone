import LinkButton from '../../components/ui/Links/LinkButton';

export default function NotFound() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-gold">
        Page not found
      </h1>
      <p className="text-ink-muted">This page does not exist.</p>
      <LinkButton to="/">Back to home</LinkButton>
    </div>
  );
}
