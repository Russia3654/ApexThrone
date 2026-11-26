import { ChangeEvent } from 'react';

type TextAreaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextAreaField({ label, name, value, onChange }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="font-display text-sm uppercase tracking-wider text-ink-muted"
        htmlFor={name}
      >
        {label}
      </label>
      <textarea
        className="border border-surface-2 bg-surface px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={8}
        maxLength={20000}
      />
    </div>
  );
}
