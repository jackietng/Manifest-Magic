// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaFacebookF } from 'react-icons/fa';
import headerLogo from '../assets/header_logo.png';
import '../index.css';

const HomePage = () => {
  return (
    <div className="min-h-screen font-sans text-deepPurple px-6 py-10 flex flex-col items-center justify-between">
      {/* Hero Content */}
      <div className="text-center max-w-3xl w-full">
        <div className="flex justify-center">
          <img
            src={headerLogo}
            alt="Manifest Magic Logo"
            className="rounded-full"
            style={{
              width: "300px",
              height: "300px",
              objectFit: "cover",
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))",
            }}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">
          Manifestation Mood Board, Mood Tracker and Journal
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto">
          Visualize your dreams and intentions with a personalized mood board.
        </p>
        <Link to="/moodboard" className="inline-block">
          <button className="button text-white px-6 py-3 rounded-full text-lg hover:shadow-lg mt-6">
            Create Your Moodboard
          </button>
        </Link>
      </div>
      {/* Testimonial */}
      <div className="bg-blush p-6 mt-10 rounded-lg max-w-xl text-center shadow-md">
        <p className="text-xl italic">
          "Creating a mood board has helped me stay focused and inspired on my journey."
        </p>
      </div>
    </div>
  );
};

export default HomePage;