import { ChangeEvent, FormEvent } from 'react';
import { AdminPage } from '../../../types/api';
import { PageFormValues } from '../../../types/forms';
import Button from '../Buttons/Button';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';
import TextField from './TextField';

type PageFormProps = {
  values: PageFormValues;
  corePages: AdminPage[];
  isCore: boolean;
  error: string | null;
  saving: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function PageForm(props: PageFormProps) {
  const { values, corePages, isCore, error, saving, onChange, onSubmit } = props;
  const parents = corePages.map((page) => ({ value: String(page.id), label: page.menu_name }));

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      {!isCore && (
        <SelectField
          label="Parent page"
          name="parent_ID"
          value={values.parent_ID}
          onChange={onChange}
          options={parents}
        />
      )}
      <TextField
        label="Menu name"
        name="menu_name"
        value={values.menu_name}
        onChange={onChange}
        maxLength={isCore ? 20 : 100}
      />
      <TextField
        label="Slug (lowercase, digits, hyphens)"
        name="slug"
        value={values.slug}
        onChange={onChange}
        maxLength={100}
        disabled={isCore}
      />
      <TextField
        label="Position"
        name="position"
        type="number"
        value={values.position}
        onChange={onChange}
      />
      <TextField
        label="Maximum subjects"
        name="max_element"
        type="number"
        value={values.max_element}
        onChange={onChange}
      />
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
