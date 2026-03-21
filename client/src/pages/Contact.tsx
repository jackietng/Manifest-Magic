// src/pages/Contact.tsx
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { theme } = useTheme();

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
  };

  const labelStyle = {
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_PROXY_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Your message has been sent! We will get back to you soon.");
        setForm({ name: "", email: "", message: "" });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setSending(false);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl text-center font-bold mb-6"
        style={{ color: theme === "dark" ? "var(--snow)" : "var(--primary)" }}
      >
        Contact Us
      </h1>
      <form onSubmit={handleSubmit} className="rounded-lg p-6 space-y-4">
        <div>
          <label
            className="block font-semibold mb-1"
            htmlFor="name"
            style={labelStyle}
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block font-semibold mb-1"
            htmlFor="email"
            style={labelStyle}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block font-semibold mb-1"
            htmlFor="message"
            style={labelStyle}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-purple-300 rounded-md resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none"
            style={inputStyle}
          ></textarea>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2 rounded-md hover:shadow-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-white"
            style={{ backgroundColor: "var(--lilac)" }}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
        {success && (
          <p
            className="text-center mt-2"
            style={{ color: theme === "dark" ? "var(--snow)" : "var(--primary)" }}
          >
            Your message has been sent! We will get back to you soon. {theme === "dark" ? "🤍" : "💜"}
          </p>
        )}
        {error && (
          <p className="text-center mt-2" style={{ color: "var(--rose)" }}>
            {error}
          </p>
        )}
      </form>
    </section>
  );
};

export default Contact;