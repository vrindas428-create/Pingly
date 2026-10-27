import { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Field } from "../components/Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { useToast } from "../context/AppProviders.jsx";
import { required, minLen, phoneOrEmail } from "../utils/validators.js";

export function LostFoundPage({ items, addItem, requireLogin }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImageError("");
    if (!file) return setImage(null);
    if (file.size > 800 * 1024) {
      e.target.value = "";
      setImage(null);
      return setImageError("Image must be under 800 KB.");
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  const form = useForm(
    { kind: "Lost", item: "", place: "", contact: "" },
    { item: [required("Item"), minLen("Item", 3)], place: [required("Location")], contact: [required("Contact"), phoneOrEmail] },
    (v, reset) => {
      if (!requireLogin("report an item")) return;
      addItem({ kind: v.kind, item: v.item.trim(), place: v.place.trim(), contact: v.contact.trim(), image });
      reset();
      setImage(null);
      toast("Item posted.", "success");
    }
  );

  return (
    <div>
      <PageHeader eyebrow="CAMPUS //" title="Lost & Found" sub="Report or claim items around campus." />
      <form className="form card" onSubmit={form.handleSubmit} noValidate style={{ marginBottom: 24 }}>
        <Field label="Type" as="select" {...form.field("kind")}>
          <option>Lost</option>
          <option>Found</option>
        </Field>
        <Field label="Item" placeholder="Blue water bottle" {...form.field("item")} />
        <Field label="Location" placeholder="Library, 2nd floor" {...form.field("place")} />
        <Field label="Contact details" placeholder="10-digit phone or college email" {...form.field("contact")} />
        <Field label="Add a picture (optional)" type="file" accept="image/*" onChange={handleImageChange} error={imageError} />
        {image && <img className="image-preview" src={image} alt="Selected preview" />}
        <button type="submit" className="btn btn--primary btn--block">Post →</button>
      </form>
      <div className="grid-cards">
        {items.map((it) => (
          <div className="card lostfound-card" key={it.id}>
            {it.image && <img className="lostfound-card__image" src={it.image} alt={it.item} />}
            <span className={"tag" + (it.kind === "Lost" ? " tag--warn" : "")}>{it.kind}</span>
            <h3>{it.item}</h3>
            <p className="muted">
              <MapPin size={14} /> {it.place}
            </p>
            {it.contact && (
              <p className="muted">
                <Phone size={14} /> {it.contact}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
