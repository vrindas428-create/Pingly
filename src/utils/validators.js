// Each validator returns "" when valid, or an error message.
export const required = (label) => (v) => (v && String(v).trim() ? "" : `${label} is required`);
export const minLen = (label, n) => (v) => (String(v || "").trim().length >= n ? "" : `${label} must be at least ${n} characters`);
export const maxLen = (label, n) => (v) => (String(v || "").length <= n ? "" : `${label} must be ${n} characters or fewer`);
export const collegeEmail = (v) =>
  /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/.test((v || "").trim()) ? "" : "Use your college email ending in @chitkara.edu.in";
export const phoneOrEmail = (v) =>
  /^\d{10}$/.test((v || "").trim()) || /^\S+@\S+\.\S+$/.test((v || "").trim()) ? "" : "Enter a 10-digit phone number or an email";
export const githubName = (v) =>
  /^[a-z\d](?:[a-z\d-]{0,38})$/i.test((v || "").trim()) ? "" : "Enter a valid GitHub username";
// Optional LinkedIn profile: empty is fine; otherwise it must look like linkedin.com/in/<handle>.
export const linkedinUrl = (v) =>
  !v || !String(v).trim() || /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[\w\-%.]+\/?(\?\S*)?$/i.test(String(v).trim())
    ? "" : "Enter a LinkedIn profile link like linkedin.com/in/your-name";
export const normalizeLinkedin = (v) => {
  const t = String(v || "").trim();
  return t ? (/^https?:\/\//i.test(t) ? t : "https://" + t) : "";
};
export const fileMaxKB = (kb) => (f) => (f && f.size > kb * 1024 ? `Image must be under ${kb} KB` : "");

export function validate(rules, values) {
  const errors = {};
  for (const [key, fns] of Object.entries(rules)) {
    const msg = fns.map((fn) => fn(values[key], values)).find(Boolean);
    if (msg) errors[key] = msg;
  }
  return errors;
}
