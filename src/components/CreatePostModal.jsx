import { useState } from "react";
import { CATEGORIES } from "../data/categories.js";
import { Modal } from "./Modal.jsx";
import { Field } from "./Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { required, minLen, maxLen } from "../utils/validators.js";

export function CreatePostModal({ onClose, onSubmit, user }) {
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImageError("");
    if (!file) return setImage(null);
    if (file.size > 800 * 1024) { // data URLs live in localStorage (~5 MB total)
      e.target.value = "";
      setImage(null);
      return setImageError("Image must be under 800 KB.");
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  const form = useForm(
    { title: "", category: "Discussion", desc: "", tags: "" },
    { title: [required("Title"), minLen("Title", 5), maxLen("Title", 120)], desc: [maxLen("Description", 600)] },
    (v) => {
      onSubmit({
        author: user.name,
        verified: true,
        authorInfo: user.email,
        category: v.category,
        title: v.title.trim(),
        desc: v.desc.trim(),
        tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image,
      });
      onClose();
    }
  );

  return (
    <Modal title="Create a Post" onClose={onClose}>
      <form onSubmit={form.handleSubmit} className="form" noValidate>
        <Field label="Title" placeholder="What’s happening?" {...form.field("title")} />
        <Field label="Category" as="select" {...form.field("category")}>
          {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
        </Field>
        <Field label="Description" as="textarea" rows={4} placeholder="Tell the community more..." {...form.field("desc")} />
        <Field label="Tags (comma separated)" placeholder="DSA, CSE, Exam" {...form.field("tags")} />
        <Field label="Add a picture" type="file" accept="image/*" onChange={handleImageChange} error={imageError} />
        {image && <img className="image-preview" src={image} alt="Selected preview" />}
        <button type="submit" className="btn btn--primary btn--block">Publish Ping →</button>
      </form>
    </Modal>
  );
}
