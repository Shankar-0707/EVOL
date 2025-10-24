// src/pages/ViewMemories.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  BookMarked,
  CalendarDays,
  Heart,
  X,
} from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion"; // <-- Import Framer Motion
import toast from "react-hot-toast";
import API from "../utils/api";



// const BASE_API_URL = "https://evol-k431.onrender.com/our-memories";

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

// --- ANIMATION COMPONENTS ---

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

// --- MAIN COMPONENT ---
const ViewMemories = () => {
  const navigate = useNavigate();
  const mousePosition = useMousePosition();

  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // --- FETCH ALL MEMORIES FUNCTION ---
  const fetchMemories = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isPopupOpen) {
        closeMemoryPopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  // --- DELETE MEMORY FUNCTION ---
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to remove this beautiful memory?")
    ) {
      return;
    }

    try {
      await API.delete(`/our-memories/delete-memory/${id}`);
      setMemories(memories.filter((memory) => memory._id !== id));
      toast.success("Memory deleted successfully! 💔", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete memory.";
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

  // --- Popup functions ---
  const openMemoryPopup = (memory) => {
    setSelectedMemory(memory);
    setIsPopupOpen(true);
  };

  const closeMemoryPopup = () => {
    setSelectedMemory(null);
    setIsPopupOpen(false);
  };

  // ... (Rendering logic for isLoading, error, no memories remains the same) ...

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* 🚨 NEW: SUBTLE GRADIENT BACKGROUND GLOW (Follows Mouse) 🚨 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px at ${mousePosition.x * 20 + 50}% ${
            mousePosition.y * 20 + 50
          }%, rgba(236, 72, 153, 0.15) 0%, rgba(255, 255, 255, 0) 100%)`,
          transition: "background 0.3s ease-out", // Smooth transition for the glow
        }}
      />
      {/* End Background Glow */}

      {/* Header and Control Buttons */}
      <div className="relative z-10">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            <span className="text-purple-600">Our</span> Memories
          </h1>

          <div className="flex space-x-3">
            {/* Back to Dashboard Button */}
            <button
              onClick={() => navigate("/our-memories/add-memory")}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
              disabled={isLoading}
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </button>
            {/* Back to Add Memories Button */}
            <button
              onClick={() => navigate("/our-memories/add-memory")}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition duration-150 shadow-md"
              disabled={isLoading}
            >
              <Heart size={20} className="mr-1" />
              Add New Memory
            </button>
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
            <button
              onClick={() => navigate("/our-memories/add-memory")}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            >
              Add First Memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory, index) => (
              <motion.div
                key={memory._id}
                className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-pink-400 flex flex-col hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }} // Staggered entry animation
                onClick={() => openMemoryPopup(memory)}
              >
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                  {memory.title}
                </h2>
                <p className="text-sm font-medium text-pink-600 mb-4 flex items-center">
                  <CalendarDays size={16} className="mr-2" />
                  {formatDate(memory.date)}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Added by:{" "}
                    <span className="font-semibold text-purple-600">
                      {memory.addedBy}
                    </span>
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent popup from opening when clicking delete
                      handleDelete(memory._id);
                    }}
                    className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                    aria-label={`Remove ${memory.title}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Memory Popup Modal */}
      {isPopupOpen && selectedMemory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeMemoryPopup}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedMemory.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-medium flex items-center">
                    <CalendarDays size={16} className="mr-1" />
                    {formatDate(selectedMemory.date)}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    Added by: <span className="text-purple-600 font-semibold">{selectedMemory.addedBy}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeMemoryPopup}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150"
                aria-label="Close popup"
              >
                <X size={24} />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap italic border-l-4 border-purple-200 pl-4">
                  "{selectedMemory.description}"
                </div>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  handleDelete(selectedMemory._id);
                  closeMemoryPopup();
                }}
                className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition duration-150 font-medium"
              >
                Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMemories;
