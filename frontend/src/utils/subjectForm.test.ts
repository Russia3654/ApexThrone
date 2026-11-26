import { AdminSubject } from '../types/api';
import { EMPTY_SUBJECT_VALUES, toSubjectInput, toSubjectValues } from './subjectForm';

const subject: AdminSubject = {
  id: 4,
  page_ID: 2,
  menu_name: 'Who we are',
  position: 3,
  visible: true,
  content: 'Line one\nLine two',
  status: 'published',
  created_at: '2026-11-26 10:00:00',
  updated_at: '2026-11-26 10:00:00',
};

test('a subject goes to form values and back without losing anything', () => {
  expect(toSubjectInput(toSubjectValues(subject))).toEqual({
    page_ID: 2,
    menu_name: 'Who we are',
    position: 3,
    visible: 1,
    content: 'Line one\nLine two',
    status: 'published',
  });
});

test('a new subject starts hidden, as a draft', () => {
  expect(toSubjectInput({ ...EMPTY_SUBJECT_VALUES, page_ID: '2' })).toMatchObject({
    page_ID: 2,
    visible: 0,
    status: 'draft',
    content: '',
  });
});
