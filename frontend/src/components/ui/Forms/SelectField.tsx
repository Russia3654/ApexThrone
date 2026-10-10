import { ChangeEvent } from 'react';

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};
const SelectField = ({ label, name, value, onChange, options }: SelectFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="font-display text-sm uppercase tracking-wider text-ink-muted"
        htmlFor={name}
      >
        {label}
      </label>
      <select
        className="border border-surface-2 bg-surface px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
