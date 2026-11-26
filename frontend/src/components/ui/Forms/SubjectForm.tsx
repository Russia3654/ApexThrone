import { ChangeEvent, FormEvent } from 'react';
import { SubjectFormValues } from '../../../types/forms';
import Button from '../Buttons/Button';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';
import TextAreaField from './TextAreaField';
import TextField from './TextField';

type SubjectFormProps = {
  values: SubjectFormValues;
  pageOptions: { value: string; label: string }[];
  error: string | null;
  saving: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function SubjectForm(props: SubjectFormProps) {
  const { values, pageOptions, error, saving, onChange, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <SelectField
        label="Page"
        name="page_ID"
        value={values.page_ID}
        onChange={onChange}
        options={pageOptions}
      />
      <TextField
        label="Section name"
        name="menu_name"
        value={values.menu_name}
        onChange={onChange}
        maxLength={100}
      />
      <TextField
        label="Position"
        name="position"
        type="number"
        value={values.position}
        onChange={onChange}
      />
      <TextAreaField label="Content" name="content" value={values.content} onChange={onChange} />
      <SelectField
        label="Status"
        name="status"
        value={values.status}
        onChange={onChange}
        options={['draft', 'published', 'archived']}
      />
      <CheckboxField label="Visible" name="visible" checked={values.visible} onChange={onChange} />
      {error && (
        <p role="alert" className="text-crimson">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
