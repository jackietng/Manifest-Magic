//src/components/common/NavBar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import type { SVGProps } from 'react';
import { supabase } from '../../lib/supabaseClient';
import crystalBall from '../../assets/crystal_ball.png';
import { useTheme } from '../../context/ThemeContext';

export function MdiCrystalBall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="#FFFFFF"
        d="m9.38 8.38l2.12.96l2.12-.96l-.96 2.12l.96 2.12l-2.12-.96l-2.12.96l.96-2.12zM16.5 2.5l1.09 2.91L20.5 6.5l-2.91 1.09l-1.09 2.91l-1.09-2.91L12.5 6.5l2.91-1.09zM6 19h1v-1a1 1 0 0 1 1-1h.26a7.47 7.47 0 0 1-3.76-6.5A7.5 7.5 0 0 1 12 3c1.05 0 2.05.22 2.96.61l-.37.98l-1.42.53Q12.6 5 12 5a5.5 5.5 0 0 0-5.5 5.5A5.5 5.5 0 0 0 12 16c2.91 0 5.3-2.27 5.5-5.13l.91-2.46l.71-.27c.25.74.38 1.54.38 2.36c0 2.78-1.5 5.2-3.76 6.5H16a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2"
      ></path>
    </svg>
  );
}

type NavBarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const NavBar = ({ isOpen, setIsOpen }: NavBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayName, avatarEmoji } = useProfile();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setIsOpen(false);
      navigate("/");
    }
  };

  const navLinks = ['about', 'moodboard', 'dashboard', 'contact'];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 text-white p-2 rounded-full shadow-lg transition"
        style={{ backgroundColor: "var(--plum)" }}
        aria-label="Toggle Navigation"
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{
            backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col
          shadow-2xl transform transition-transform duration-300 ease-in-out
          w-full md:w-64 overflow-y-auto 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: "transparent",
          borderRight: "none",
        }}
      >
        {/* Crystal ball and title */}
        <Link
          to="/"
          className="flex flex-col items-center gap-0 mt-8 sm:mt-12 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
        >
          <img
            src={crystalBall}
            alt="Crystal Ball"
            className="rounded-full"
            style={{
              width: "clamp(100px, 20vh, 200px)",
              height: "clamp(100px, 20vh, 200px)",
              objectFit: "cover",
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))",
            }}
          />
          <span
            className="font-bold text-lg tracking-wide text-center -mt-4"
            style={{ color: textColor }}
          >
            Manifest Magic
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
          {navLinks.map((item) => (
            <Link
              key={item}
              to={`/${item}`}
              className="px-4 py-3 rounded-xl transition duration-200 text-sm font-medium flex items-center gap-2 no-underline"
              style={{ color: textColor, textDecoration: "none" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: "14px" }}>✨</span>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div
          className="px-4 py-6 flex flex-col gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          {!user ? (
            <>
              <button
                onClick={() => { navigate("/signup"); setIsOpen(false); }}
                className="w-full py-2 rounded-xl text-sm font-medium transition duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "transparent",
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Sign Up
              </button>
              <button
                onClick={() => { navigate("/login"); setIsOpen(false); }}
                className="w-full py-2 rounded-xl text-sm font-medium transition duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "transparent",
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              {/* Avatar and display name — links to profile */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-2 py-2 rounded-xl no-underline transition duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                }}
              >
                <div
                  style={{
                    fontSize: "1.8rem",
                    lineHeight: 1,
                    minWidth: "40px",
                    textAlign: "center",
                  }}
                >
                  {avatarEmoji}
                </div>
                <div className="flex flex-col min-w-0 justify-center">
                  <p
                    className="font-medium text-md truncate"
                    style={{ color: textColor }}
                  >
                    {displayName || user.email}
                  </p>
                </div>
              </Link>
              {/* Log out button */}
              <button
                onClick={handleSignOut}
                className="w-full py-2 rounded-xl text-sm font-medium transition duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "transparent",
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default NavBar;