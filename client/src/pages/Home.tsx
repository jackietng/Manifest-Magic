// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import headerLogo from '../assets/header_logo.png';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";

  return (
    <div className="min-h-screen font-sans px-4 sm:px-6 py-10 flex flex-col items-center justify-between gap-10">

      {/* Hero Content */}
      <div className="text-center max-w-3xl w-full flex flex-col items-center gap-6">

        {/* Logo — smaller on mobile */}
        <img
          src={headerLogo}
          alt="Manifest Magic Logo"
          className="rounded-full"
          style={{
            width: "clamp(200px, 40vw, 300px)",
            height: "clamp(200px, 40vw, 300px)",
            objectFit: "cover",
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))",
          }}
        />

        <h1
          className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight"
          style={{ color: textColor }}
        >
          Manifestation Mood Board, Mood Tracker and Journal
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl max-w-xl mx-auto"
          style={{ color: textColor }}
        >
          Visualize your dreams and intentions with a personalized mood board.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link to="/signup">
            <button 
              className="button px-6 py-3 text-lg hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "var(--violet)",
                color: textColor,
              }}
              >
                ✨ Sign Up Free ✨
              </button>
          </Link>
          <Link to="/moodboard">
            <button 
              className="button px-6 py-3 rounded-full text-lg hover:shadow-lg transition-shadow"
              style={{
                color: textColor,
              }}
              >
              Create Your Moodboard
            </button>
          </Link>
        </div>
      </div>

      {/* Testimonial */}
      <div
        className="p-6 rounded-2xl max-w-xl w-full text-center shadow-md mx-4"
        style={{ backgroundColor: "transparent" }}
      >
        <p
          className="text-base sm:text-xl italic leading-relaxed"
          style={{ color: textColor }}
        >
          "Creating a mood board has helped me stay focused and inspired on my journey." - J
        </p>
      </div>

    </div>
  );
};

export default HomePage;