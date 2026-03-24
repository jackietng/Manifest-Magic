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
import Profile from "./pages/Profile";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col min-h-screen">
      <NavBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <ThemeToggle />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64 ml-0" : "md:ml-10 ml-0"
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
                  <DynamicMoodBoard setSidebarOpen={setSidebarOpen} />
                </>
              }
            />
          </Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64 ml-0" : "md:ml-10 ml-0"
        }`}
      >
        <Footer />
      </footer>
    </div>
  );
}

export default App;