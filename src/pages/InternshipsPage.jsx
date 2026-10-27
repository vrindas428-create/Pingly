import { useState } from "react";
import { X } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Field } from "../components/Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { required, collegeEmail, linkedinUrl } from "../utils/validators.js";
import { useToast, useAuth } from "../context/AppProviders.jsx";
import { JobsBoard } from "../components/JobsBoard.jsx";

export function InternshipsPage({ placements, toggleInterest, requireLogin }) {
  const { user } = useAuth();
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const toast = useToast();

  const form = useForm(
    { name: "", email: "", semester: "", skills: "", linkedin: "" },
    {
      name: [required("Full name")],
      email: [required("College email"), collegeEmail],
      semester: [required("Semester")],
      skills: [required("Skills")],
      linkedin: [linkedinUrl],
    },
    (_values, reset) => {
      toggleInterest(selectedPlacement.id);
      setSelectedPlacement(null);
      reset();
      toast("Your internship application interest has been submitted!", "success");
    }
  );

  function handleInterest(placement) {
    if (placement.interested) {
      toggleInterest(placement.id);
      toast("Internship interest removed.", "info");
      return;
    }
    if (requireLogin("show interest in a placement")) {
      setSelectedPlacement(placement);
      form.reset();
      form.set("linkedin", user?.linkedin || "");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="CAREER //" title="Internships" sub="Internship openings shared by seniors, alumni and the training & placement cell." />
      <div className="grid-cards">
        {placements.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.company}</h3>
            <p className="muted">{p.role}</p>
            <p className="muted">Apply before {p.deadline}</p>
            <button className={"btn " + (p.interested ? "btn--outline" : "btn--primary")} onClick={() => handleInterest(p)}>
              {p.interested ? "Interested ✓ (Remove)" : "I'm interested"}
            </button>
          </div>
        ))}
      </div>

      <JobsBoard />

      {selectedPlacement && (
        <div className="modal-overlay" onClick={() => setSelectedPlacement(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Internship interest form" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setSelectedPlacement(null)} aria-label="Close form">
              <X size={18} />
            </button>
            <p className="eyebrow">INTERNSHIP INTEREST //</p>
            <h2>{selectedPlacement.company}</h2>
            <p className="muted">Share your details to register your interest in the {selectedPlacement.role} internship.</p>
            <form className="form" onSubmit={form.handleSubmit} noValidate>
              <Field label="Full name" placeholder="Enter your name" {...form.field("name")} />
              <Field label="Chitkara email" type="email" placeholder="name@chitkara.edu.in" {...form.field("email")} />
              <Field label="Semester" as="select" {...form.field("semester")}>
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}
              </Field>
              <Field label="Skills / technologies" placeholder="e.g. HTML, CSS, JavaScript" {...form.field("skills")} />
              <Field label="LinkedIn profile (optional)" type="url" placeholder="linkedin.com/in/your-name" {...form.field("linkedin")} />
              <button type="submit" className="btn btn--primary btn--block">Submit Interest</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
