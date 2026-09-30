type AuthInputProps = {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function AuthInput({
  label,
  id,
  type = 'text',
  value,
  placeholder,
  required,
  onChange,
}: AuthInputProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
