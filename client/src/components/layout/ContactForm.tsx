import React, { useState, type JSX } from "react";
import "../styles/contactform.css";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
     Handle Input Change
  ------------------------------ */
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* -----------------------------
     Validation
  ------------------------------ */
  const validate = (): string | null => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Please enter your name.";

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email.";

    if (!form.message || form.message.trim().length < 5)
      return "Please enter a message (5+ chars).";

    return null;
  };

  /* -----------------------------
     Submit Handler
  ------------------------------ */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await res.json(); // we don't need returned data
        setSuccess("Thanks — your message was sent!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || "Failed to send. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="field-row">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={onChange} />
      </div>

      <div className="field-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={form.email} onChange={onChange} />
      </div>

      <div className="field-row">
        <label htmlFor="subject">Subject (optional)</label>
        <input
          id="subject"
          name="subject"
          value={form.subject}
          onChange={onChange}
        />
      </div>

      <div className="field-row">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={form.message}
          onChange={onChange}
        />
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-send" disabled={loading}>
          {loading ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}