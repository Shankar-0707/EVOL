// src/pages/ViewMemories.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  CalendarDays,
  Heart,
  BookOpen, // Added for View Deleted button
} from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import toast from "react-hot-toast";
import API from "../utils/api"; // Assuming your global Axios instance is here

// -------------------------------------------------------------------
// --- CUSTOM HOOKS AND ANIMATION COMPONENTS ---
// -------------------------------------------------------------------

// Helper hook to track mouse position for parallax effect
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setMousePosition({
        x: (e.clientX - centerX) / 100, 
        y: (e.clientY - centerY) / 100,
      });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};

// Animation component for the individual dots
const PartnerDot = ({ color, initialX, delay }) => (
  <motion.div
    className={`w-6 h-6 rounded-full shadow-lg absolute`}
    style={{ backgroundColor: color }}
    initial={{ x: initialX, opacity: 0 }}
    animate={{
      x: 0,
      opacity: 1,
      y: [0, -10, 0], // Gentle vertical movement
    }}
    transition={{
      duration: 3,
      delay: delay,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
      times: [0, 0.5, 1],
    }}
  />
);

// Main Couple Animation using Parallax
const CoupleAnimation = () => {
  const { x: mouseX, y: mouseY } = useMousePosition();
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const heartX = useTransform(smoothX, (value) => value * 2);
  const heartY = useTransform(smoothY, (value) => value * 2);

  const containerRotateX = useTransform(smoothY, (value) => value * -0.5);
  const containerRotateY = useTransform(smoothX, (value) => value * 0.5);

  return (
    <motion.div
      className="flex justify-center items-center h-40 mb-10 relative perspective-lg"
      style={{
        rotateX: containerRotateX,
        rotateY: containerRotateY,
      }}
    >
      <PartnerDot color="#EC4899" initialX={-100} delay={0} />
      <PartnerDot color="#6366F1" initialX={100} delay={0.5} />
      <motion.div
        className="text-4xl absolute z-10"
        style={{ x: heartX, y: heartY }}
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


// -------------------------------------------------------------------
// --- MAIN VIEW MEMORIES COMPONENT ---
// -------------------------------------------------------------------

const ViewMemories = () => {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH ALL MEMORIES FUNCTION ---
  const fetchMemories = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Updated API path based on previous structure: /our-memories/view
      const response = await API.get(`/our-memories/view-memories`); 
      setMemories(response.data.allMemories);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Could not load memories. Check server.");
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // --- SOFT DELETE MEMORY FUNCTION (Archives the memory) ---
  const handleDelete = async (id, title) => {
    if (
      !window.confirm(`Are you sure you want to archive the memory: "${title}"?`)
    ) {
      return;
    }

    try {
        // DELETE request to the soft-delete endpoint
      await API.delete(`/our-memories/delete-memory/${id}`); 
      setMemories(memories.filter((memory) => memory._id !== id));
      toast.success("Memory archived successfully! 💌", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff",
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to archive memory.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // --- Helper function to format the date ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* 🚨 DYNAMIC BACKGROUND GLOW 🚨 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px at ${mousePosition.x * 20 + 50}% ${
            mousePosition.y * 20 + 50
          }%, rgba(236, 72, 153, 0.15) 0%, rgba(255, 255, 255, 0) 100%)`,
          transition: "background 0.3s ease-out",
        }}
      />

      <div className="relative z-10">
        {/* Header and Control Buttons */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky top-0 z-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            <span className="text-purple-600">Active</span> Memories
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

            {/* Add New Memory Button */}
            <motion.button
              onClick={() => navigate("/our-memories/add-memory")}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <Heart size={20} className="mr-1" />
              Add New Memory
            </motion.button>
            
            {/* --- NEW BUTTON: VIEW DELETED MEMORIES --- */}
            <motion.button 
                onClick={() => navigate('/our-memories/view-all-deleted-memories')}
                className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-gray-500 text-white hover:bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
            >
                <Trash2 size={20} className="mr-1" />
                Deleted Memories
            </motion.button>
          </div>
        </header>

        {/* Couple Animation */}
        {!isLoading && !error && memories.length > 0 && <CoupleAnimation />}

        {/* Memories Grid Content */}
        {isLoading ? (
          <div className="text-center py-16 text-purple-500">
            <Loader2 size={32} className="mx-auto animate-spin mb-3" />
            <p className="text-lg font-medium">Fetching beautiful moments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
            <p className="text-xl font-semibold">Error:</p>
            <p className="mt-2">{error}</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
            <p className="text-lg">No shared memories yet! Let's make some.</p>
            <motion.button
              onClick={() => navigate("/add-memories")}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              Add First Memory
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory, index) => (
              <motion.div
                key={memory._id}
                className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-pink-400 flex flex-col hover:shadow-2xl transition duration-300 transform hover:scale-[1.02]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }} // Staggered entry animation
              >
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                  {memory.title}
                </h2>
                <p className="text-sm font-medium text-pink-600 mb-4 flex items-center">
                  <CalendarDays size={16} className="mr-2" />
                  {formatDate(memory.date)}
                </p>

                <div className="flex-grow text-gray-700 mb-4 border-l-4 border-purple-200 max-h-32 pl-3 italic overflow-y-auto">
                  "{memory.description}"
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Added by:{" "}
                    <span className="font-semibold text-purple-600">
                      {memory.addedBy}
                    </span>
                  </p>
                  <motion.button
                    onClick={() => handleDelete(memory._id, memory.title)}
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
        )}
      </div>
    </div>
  );
};

export default ViewMemories;