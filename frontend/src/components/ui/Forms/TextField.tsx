import { ChangeEvent } from 'react';

type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TextField = ({ label, name, value, onChange }: TextFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="font-display text-sm uppercase tracking-wider text-ink-muted"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className="border border-surface-2 bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type="text"
      />
    </div>
  );
};

export default TextField;
