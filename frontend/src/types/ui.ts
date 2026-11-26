import { AdminSubject } from './api';

export type ButtonVariant = 'primary' | 'danger';
export type ButtonType = 'submit' | 'button';

export type NavItem = { to: string; label: string };
export type SubjectListItem = { subject: AdminSubject; pageName: string };
