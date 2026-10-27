import { useState } from "react";
import { Clock, MapPin, Bookmark, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Field } from "../components/Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { required, collegeEmail } from "../utils/validators.js";
import { useToast } from "../context/AppProviders.jsx";

export function EventsPage({ events, toggleRegister, toggleSave, requireLogin }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const toast = useToast();

  const form = useForm(
    { name: "", email: "", semester: "" },
    {
      name: [required("Name")],
      email: [required("College email"), collegeEmail],
      semester: [required("Semester")],
    },
    (values, reset) => {
      toggleRegister(selectedEvent.id);
      setSelectedEvent(null);
      reset();
      toast("Registration submitted successfully!", "success");
    }
  );

  function openRegistration(event) {
    if (event.registered) {
      toggleRegister(event.id);
      toast("Your registration has been cancelled.", "info");
    } else if (requireLogin("register for an event")) {
      setSelectedEvent(event);
      form.reset();
    }
  }

  return (
    <div>
      <PageHeader eyebrow="CAMPUS LIFE //" title="Events" sub="Hackathons, workshops, cultural events, clubs and competitions." />
      <div className="grid-cards">
        {events.map((ev) => (
          <div className="card" key={ev.id}>
            {ev.image ? <img className="event-banner__image" src={ev.image} alt={ev.title} loading="lazy" /> : <div className="event-banner">{ev.tag}</div>}
            <p className="eyebrow">{ev.tag} //</p>
            <h3>{ev.title}</h3>
            <p className="muted"><Clock size={14} /> {ev.date}</p>
            <p className="muted"><MapPin size={14} /> {ev.place}</p>
            <button
              className={"btn " + (ev.registered ? "btn--outline" : "btn--primary") + " btn--block"}
              onClick={() => openRegistration(ev)}
            >
              {ev.registered ? "Registered ✓ (Cancel)" : "Register →"}
            </button>
            <button
              className="link-btn"
              style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => toggleSave(ev.id)}
            >
              <Bookmark size={14} /> {ev.saved ? "Saved" : "Save for later"}
            </button>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Event registration" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setSelectedEvent(null)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="eyebrow">EVENT REGISTRATION //</p>
            <h2>{selectedEvent.title}</h2>
            <p className="muted">Enter your details to register for this campus event.</p>
            <form className="form" onSubmit={form.handleSubmit} noValidate>
              <Field label="Full name" placeholder="Enter your name" {...form.field("name")} />
              <Field label="Chitkara email" type="email" placeholder="name@chitkara.edu.in" {...form.field("email")} />
              <Field label="Semester" as="select" {...form.field("semester")}>
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}
              </Field>
              <button type="submit" className="btn btn--primary btn--block">Submit Registration</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
