import { render, screen } from '@testing-library/react';
import SubjectSection from './SubjectSection';

test('shows the subject name as a heading, with its content', () => {
  render(<SubjectSection subject={{ id: 1, menu_name: 'Who we are', content: 'A community.' }} />);

  expect(screen.getByRole('heading', { level: 2, name: 'Who we are' })).toBeTruthy();
  expect(screen.getByText('A community.')).toBeTruthy();
});

test('shows HTML typed by an admin as plain text, never as real elements', () => {
  const attack = '<img src="x" onerror="alert(1)"><script>alert(2)</script>';

  render(<SubjectSection subject={{ id: 2, menu_name: '<b>Bold</b>', content: attack }} />);

  // the tags are visible characters: if they had become elements, this text would not exist
  expect(screen.getByText(attack)).toBeTruthy();
  expect(screen.getByRole('heading', { name: '<b>Bold</b>' })).toBeTruthy();
  expect(screen.queryByRole('img')).toBeNull();
});
