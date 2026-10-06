import { ReactNode } from 'react';
import BackLink from './BackLink';

type BackLinkInfo = {
  to: string;
  label: string;
};

type PageHeaderProps = {
  title: string;
  backLink?: BackLinkInfo;
  actions?: ReactNode;
};

const PageHeader = ({ title, backLink, actions }: PageHeaderProps) => {
  return (
    <header className="flex flex-col items-start gap-4">
      {backLink && <BackLink to={backLink.to}>{backLink.label}</BackLink>}
      <div className="flex flex-col items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-gold">{title}</h1>
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
