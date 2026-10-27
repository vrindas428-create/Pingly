import { useState } from "react";
import { validate } from "../utils/validators.js";

// One reusable form hook: values, per-field errors (shown after blur or a
// submit attempt), and a submit handler that only fires when everything is valid.
export function useForm(initial, rules, onSubmit) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const errors = validate(rules, values);

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const field = (key) => ({
    value: values[key],
    error: touched[key] ? errors[key] : "",
    onChange: (e) => set(key, e.target.value),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
  });
  const reset = () => { setValues(initial); setTouched({}); };
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])));
    if (Object.keys(errors).length === 0) onSubmit(values, reset);
  };
  return { values, set, field, errors, handleSubmit, reset };
}
