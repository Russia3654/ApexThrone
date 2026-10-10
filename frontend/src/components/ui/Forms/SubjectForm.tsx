import { ChangeEvent, FormEvent, useState } from 'react';
import Button from '../Buttons/Button';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';
import TextField from './TextField';

type SubjectFormProps = {
  submitLabel: string;
  options: string[];
};

export default function SubjectForm({ submitLabel, options }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(options[0] ?? '');
  const [visible, setVisible] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const handlePositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPosition(event.target.value);
  };
  const handleVisibleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVisible(event.target.checked);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <TextField label="Section Name" name="sectionName" value={name} onChange={handleNameChange} />
      <SelectField
        label="Position"
        name="position"
        value={position}
        onChange={handlePositionChange}
        options={options}
      />
      <CheckboxField
        label="Visible"
        name="visible"
        checked={visible}
        onChange={handleVisibleChange}
      />
      <div className="pt-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
