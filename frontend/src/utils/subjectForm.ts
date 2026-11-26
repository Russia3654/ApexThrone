import { AdminPage, AdminSubject, SubjectInput } from '../types/api';
import { SubjectFormValues } from '../types/forms';
import { groupPages } from './groupPages';

export const EMPTY_SUBJECT_VALUES: SubjectFormValues = {
  page_ID: '',
  menu_name: '',
  position: '1',
  visible: false,
  content: '',
  status: 'draft',
};

export function toSubjectValues(subject: AdminSubject): SubjectFormValues {
  return {
    page_ID: String(subject.page_ID),
    menu_name: subject.menu_name,
    position: String(subject.position),
    visible: subject.visible,
    content: subject.content,
    status: subject.status,
  };
}

export function toSubjectInput(values: SubjectFormValues): SubjectInput {
  return {
    page_ID: Number(values.page_ID),
    menu_name: values.menu_name,
    position: Number(values.position),
    visible: values.visible ? 1 : 0,
    content: values.content,
    status: values.status,
  };
}

export function toPageOptions(pages: AdminPage[]) {
  return groupPages(pages).flatMap(({ core, subpages }) => [
    { value: String(core.id), label: core.menu_name },
    ...subpages.map((page) => ({
      value: String(page.id),
      label: `${core.menu_name} / ${page.menu_name}`,
    })),
  ]);
}
