import { ChangeEvent } from 'react';

type Option = string | { value: string; label: string };

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
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
        {options.map((option) => {
          const { value: optionValue, label: text } =
            typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <option value={optionValue} key={optionValue}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField;
