//src/components/common/Layout.tsx
import { useState, ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";
import NavBar from "./NavBar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  background?: "light" | "dark" | "dashboard" | string;
}

export default function Layout({ children, background }: LayoutProps) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bgClass = background
    ? `bg-${background}`
    : theme === "dark"
    ? "bg-dark"
    : "bg-light";

  return (
    <div className={`min-h-screen flex flex-col ${bgClass}`}>
      <NavBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main
        className={`flex-grow backdrop-blur-sm bg-white/70 dark:bg-black/60 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-10"
        }`}
      >
        {children}
      </main>
      <footer
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-10"
        }`}
      >
        <Footer />
      </footer>
    </div>
  );
}