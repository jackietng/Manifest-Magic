// src/pages/Signup.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Signup = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";
  const mutedColor = isDark ? "var(--lavender)" : "var(--orchid)";
  const inputStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: isDark ? "var(--snow)" : "var(--primary)",
    borderColor: isDark ? "var(--violet)" : "var(--plum)",
  };

  // Redirect logged in users straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email to confirm your account! 💜');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col p-8 rounded-2xl w-full max-w-md shadow-lg"
        style={{
          backgroundColor: isDark ? "#2a223a" : "var(--snow)",
        }}
      >
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: textColor }}
        >
          Start Manifesting ✨
        </h1>

        <p
          className="text-center text-sm mb-6"
          style={{ color: mutedColor }}
        >
          Create your free account to save mood boards, track your mood and journal your journey.
        </p>

        {error && (
          <p
            className="text-sm mb-4 text-center p-3 rounded-xl"
            style={{ backgroundColor: "var(--rose)", color: "white" }}
          >
            {error}
          </p>
        )}

        {message && (
          <p
            className="text-sm mb-4 text-center p-3 rounded-xl"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Create Account
          </button>
        </form>

        <p
          className="mt-6 text-sm text-center"
          style={{ color: mutedColor }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: textColor, fontWeight: 600, textDecoration: "underline" }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;