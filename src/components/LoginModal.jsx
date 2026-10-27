import { useState } from "react";
import { LogIn } from "lucide-react";
import { Modal } from "./Modal.jsx";
import { Field } from "./Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { required, minLen, collegeEmail, linkedinUrl, normalizeLinkedin } from "../utils/validators.js";

export function LoginModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const signup = mode === "signup";
  const rules = {
    email: [required("Email"), collegeEmail],
    password: [required("Password"), minLen("Password", 6)],
    ...(signup && {
      name: [required("Name"), minLen("Name", 2)],
      linkedin: [linkedinUrl],
      confirm: [(v, all) => (v === all.password ? "" : "Passwords don’t match")],
    }),
  };
  const form = useForm({ name: "", email: "", password: "", confirm: "", linkedin: "" }, rules, (v) => {
    onLogin(v.email, signup ? v.name : "", signup ? normalizeLinkedin(v.linkedin) : "");
    onClose();
  });

  return (
    <Modal title={signup ? "Join Pingly" : "Log in to Pingly"} onClose={onClose}>
      <p className="muted" style={{ marginBottom: 14 }}>Use your college email — only @chitkara.edu.in addresses can sign in.</p>
      <form onSubmit={form.handleSubmit} className="form" noValidate>
        {signup && <Field label="Full name" placeholder="Your name" {...form.field("name")} />}
        <Field label="College email" type="email" placeholder="yourname@chitkara.edu.in" {...form.field("email")} />
        <Field label="Password" type="password" placeholder="At least 6 characters" {...form.field("password")} />
        {signup && <Field label="Confirm password" type="password" {...form.field("confirm")} />}
        {signup && <Field label="LinkedIn profile (optional)" type="url" placeholder="linkedin.com/in/your-name" {...form.field("linkedin")} />}
        <button type="submit" className="btn btn--primary btn--block"><LogIn size={16} /> {signup ? "Create account" : "Log in"}</button>
      </form>
      <button className="link-btn" style={{ marginTop: 12 }} onClick={() => setMode(signup ? "login" : "signup")}>
        {signup ? "Already have an account? Log in" : "New here? Sign up"}
      </button>
    </Modal>
  );
}
