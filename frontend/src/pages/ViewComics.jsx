// src/pages/ViewComics.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  Sparkles,
  Heart,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import toast from "react-hot-toast";
import API from "../utils/api";

// const BASE_API_URL = "https://evol-k431.onrender.com/couple-comics";

// --- CUSTOM ANIMATION COMPONENTS (Assume useMousePosition, CoupleAnimation are available) ---
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      // Get center position relative to the viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Calculate distance from center
      setMousePosition({
        x: (e.clientX - centerX) / 100, // Reduced sensitivity
        y: (e.clientY - centerY) / 100, // Reduced sensitivity
      });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};

const PartnerDot = ({ color, initialX, delay }) => (
  <motion.div
    className={`w-6 h-6 rounded-full shadow-lg absolute`}
    style={{ backgroundColor: color }}
    initial={{ x: initialX, opacity: 0 }}
    animate={{
      x: 0,
      opacity: 1,
      y: -20, // Smaller, gentler vertical movement
    }}
    transition={{
      duration: 3,
      delay: delay,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
      times: [0, 0.5, 1], // Smooth oscillation
    }}
  />
);

const CoupleAnimation = () => {
  // 1. Use the custom mouse position hook
  const { x: mouseX, y: mouseY } = useMousePosition();

  // 2. Define spring physics for smooth, laggy movement
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // 3. Apply a slight transform based on mouse input for the parallax effect
  const heartX = useTransform(smoothX, (value) => value * 2);
  const heartY = useTransform(smoothY, (value) => value * 2);

  // 4. Transform the entire animation container for a subtle parallax background tilt
  const containerRotateX = useTransform(smoothY, (value) => value * -0.5);
  const containerRotateY = useTransform(smoothX, (value) => value * 0.5);

  return (
    <motion.div
      className="flex justify-center items-center h-40 mb-10 relative perspective-lg"
      style={{
        // Apply subtle 3D tilt to the container
        rotateX: containerRotateX,
        rotateY: containerRotateY,
      }}
    >
      <PartnerDot color="#EC4899" initialX={-100} delay={0} /> {/* Pink */}
      <PartnerDot color="#6366F1" initialX={100} delay={0.5} /> {/* Indigo */}
      {/* Central Heart with Mouse Parallax Effect */}
      <motion.div
        className="text-4xl absolute z-10"
        style={{ x: heartX, y: heartY }} // Apply mouse-driven movement
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          type: "spring",
          stiffness: 150,
        }}
      >
        <Heart
          size={64}
          className="text-red-500 shadow-xl filter drop-shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
};
// -----------------------------------------------------------

const ViewComics = () => {
  const navigate = useNavigate();

  const [comics, setComics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mousePosition = useMousePosition();

  // --- FETCH ALL COMICS FUNCTION ---
  const fetchComics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/couple-comics/view`);
      setComics(response.data.allComics);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Could not load comics. Check server.");
      setComics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  // --- DELETE COMIC FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comic strip?")) {
      return;
    }

    try {
      await API.delete(`/couple-comics/delete/${id}`);
      setComics(comics.filter((comic) => comic._id !== id));
      toast.success("Comic deleted successfully!", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete comic.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- RENDERING LOGIC ---
  const renderContent = () => {
    // ... (isLoading, error, no comics logic) ...
    if (isLoading) {
      return (
        /* ... Loading JSX ... */ <div className="text-center py-16 text-red-500">
          <Loader2 size={32} className="mx-auto animate-spin mb-3" />
          <p className="text-lg font-medium">Loading comic strips...</p>
        </div>
      );
    }
    if (error) {
      return (
        /* ... Error JSX ... */ <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
          <p className="text-xl font-semibold">Error:</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }

    if (comics.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">
            No comic strips created yet! Time to make one.
          </p>
          <motion.button
            onClick={() => navigate("/generate-comic")}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            Create First Comic
          </motion.button>
        </div>
      );
    }

    // --- SUCCESSFUL LIST RENDERING ---
    return (
      <>
        <CoupleAnimation />

        <div className="space-y-12 max-w-5xl mx-auto">
          {comics.map((comic, index) => (
            <motion.div
              key={comic._id}
              className="bg-white p-6 rounded-2xl shadow-2xl border-t-8 border-red-500"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 * index,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-3xl font-extrabold text-red-700 flex items-center">
                  <BookOpen size={28} className="mr-3" /> {comic.comicTitle}
                </h2>
                <div>
                  <p className="text-xs text-gray-500">Theme: {comic.theme}</p>
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(comic.createdAt)}
                  </p>
                </div>
              </div>

              {/* Comic Strip Panel Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {comic.panels.map((panel, panelIndex) => (
                  <motion.div
                    key={panelIndex}
                    className="border-2 border-red-300 rounded-lg p-3 bg-red-50 relative overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 15px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <p className="text-xs font-bold text-red-500 mb-1">
                      PANEL {panel.panelNumber}
                    </p>
                    <p className="text-xs italic text-gray-600 mb-2">
                      Setting: {panel.setting}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      "{panel.dialogue}"
                    </p>

                    {/* Speech Bubble effect */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-400 rounded-full opacity-50"></div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <motion.button
                  onClick={() => handleDelete(comic._id)}
                  className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Background Glow (Using Red/Pink for Comic theme) */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px at ${mousePosition.x * 20 + 50}% ${
            mousePosition.y * 20 + 50
          }%, rgba(239, 68, 68, 0.2) 0%, rgba(255, 255, 255, 0) 100%)`,
          transition: "background 0.3s ease-out",
        }}
      />

      <div className="relative z-10">
        {/* Header and Control Buttons */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky top-0 z-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            <span className="text-red-600">Couple</span> Comics
          </h1>

          <div className="flex space-x-3">
            {/* Back to Dashboard Button */}
            <motion.button
              onClick={() => navigate("/")}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <ChevronLeft size={20} className="mr-1" />
              Dashboard
            </motion.button>
            {/* Back to Generate Button */}
            <motion.button
              onClick={() => navigate("/couple-comics/generate")}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <Sparkles size={20} className="mr-1" />
              Generate New
            </motion.button>

            {/* --- NEW BUTTON: VIEW DELETED COMICS --- */}
            <motion.button
              onClick={() => navigate("/couple-comics/view-all-deleted-comics")} // <-- NEW ROUTE
              className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-gray-500 text-white hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <Trash2 size={20} className="mr-1" />
              Deleted Comics
            </motion.button>
          </div>
        </header>

        {/* Content Rendering */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ViewComics;
