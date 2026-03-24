// src/pages/Contact.tsx
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";

  const inputStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: isDark ? "var(--snow)" : "var(--primary)",
  };

  const labelStyle = {
    color: textColor,
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
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSending(false);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl text-center font-bold mb-6 mt-12 sm:mt-6"
        style={{ color: textColor }}
      >
        Contact Us
      </h1>

      <p
        className="text-center mb-6 text-sm sm:text-base"
        style={{ color: textColor }}
      >
        Have a question or just want to say hello? We'd love to hear from you!
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <label
            className="block font-semibold mb-1 text-sm sm:text-base"
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
            placeholder="Your name"
            className="w-full px-4 py-3 text-base border border-purple-300 rounded-xl focus:ring-2 focus:ring-[var(--violet)] focus:outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block font-semibold mb-1 text-sm sm:text-base"
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
            placeholder="your@email.com"
            className="w-full px-4 py-3 text-base border border-purple-300 rounded-xl focus:ring-2 focus:ring-[var(--violet)] focus:outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block font-semibold mb-1 text-sm sm:text-base"
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
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 text-base border border-purple-300 rounded-xl resize-none focus:ring-2 focus:ring-[var(--violet)] focus:outline-none"
            style={inputStyle}
          />
        </div>

        {/* Full width on mobile, auto on sm+ */}
        <button
          type="submit"
          disabled={sending}
          className="w-full sm:w-auto sm:px-8 py-3 rounded-xl hover:shadow-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-white font-medium"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {sending ? "Sending..." : "Send Message"}
        </button>

        {success && (
          <p
            className="text-center mt-2 text-sm sm:text-base"
            style={{ color: textColor }}
          >
            {success} {isDark ? "🤍" : "💜"}
          </p>
        )}
        {error && (
          <p
            className="text-center mt-2 text-sm sm:text-base"
            style={{ color: "var(--rose)" }}
          >
            {error}
          </p>
        )}
      </form>
    </section>
  );
};

export default Contact;