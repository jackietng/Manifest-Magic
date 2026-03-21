// src/App.tsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeToggle from "./components/common/ThemeToggle";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import About from "./pages/About";
import Moodboard from "./pages/MoodBoard";
import Contact from "./pages/Contact";
import NavBar from "./components/common/NavBar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import MoodInput from "./components/moodboard/MoodInput";
import DynamicMoodBoard from "./components/moodboard/DynamicMoodBoard";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col min-h-screen">
      <NavBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <ThemeToggle />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-10"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/moodboard/*" element={<Moodboard />}>
            <Route
              index
              element={
                <>
                  <MoodInput />
                  <DynamicMoodBoard />
                </>
              }
            />
          </Route>
        </Routes>
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

export default App;