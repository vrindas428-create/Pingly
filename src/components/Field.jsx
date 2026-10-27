import { useId } from "react";

// Reusable labelled input/select/textarea with an inline error message.
export function Field({ label, error, as: Tag = "input", children, ...props }) {
  const id = useId();
  return (
    <label className={"field" + (error ? " field--error" : "")} htmlFor={id}>
      {label}
      <Tag id={id} aria-invalid={!!error} {...props}>
        {children}
      </Tag>
      {error && <span className="form-error" role="alert">{error}</span>}
    </label>
  );
}
