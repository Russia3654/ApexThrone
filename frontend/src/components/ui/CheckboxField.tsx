import { ChangeEvent } from 'react';

type CheckboxFieldProps = {
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const CheckboxField = ({ label, name, checked, onChange }: CheckboxFieldProps) => {
  return (
    <div className="flex items-center gap-2">
      <label
        className="font-display text-sm uppercase tracking-wider text-ink-muted"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className="h-4 w-4 accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        type="checkbox"
        name={name}
        id={name}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

export default CheckboxField;
