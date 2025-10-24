// src/pages/ViewQuiz.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  Trash2,
  Loader2,
  Sparkles,
  HelpCircle,
  Heart,
} from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import toast from "react-hot-toast";


const BASE_API_URL = "https://evol-k431.onrender.com/couple-quiz";

// --- CUSTOM ANIMATION COMPONENTS (Ensure these helper components are defined/imported) ---
// For brevity, assume useMousePosition, PartnerDot, and CoupleAnimation are available
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
// -----------------------------------------------------------

const ViewQuiz = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to track which answer is currently being revealed
  const [revealedAnswerId, setRevealedAnswerId] = useState(null);

  const mousePosition = useMousePosition();

  // --- FETCH ALL QUESTIONS FUNCTION ---
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_API_URL}/view`);
      setQuestions(response.data.allQuestions);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Could not load questions. Check server and API.");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // --- DELETE QUESTION FUNCTION ---
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this quiz question?")
    ) {
      return;
    }

    try {
      await axios.delete(`${BASE_API_URL}/delete/${id}`);
      setQuestions(questions.filter((q) => q._id !== id));
      toast.success("Question deleted successfully!", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete question.";
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
    // ... (isLoading and error logic goes here - similar to ViewMoodMuse) ...
    if (isLoading) {
      return (
        /* ... Loading JSX ... */ <div className="text-center py-16 text-purple-500">
          <Loader2 size={32} className="mx-auto animate-spin mb-3" />
          <p className="text-lg font-medium">Loading quiz questions...</p>
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

    if (questions.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">No quiz questions generated yet!</p>
          <motion.button
            onClick={() => navigate("/couple-quiz/generate")}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            Generate First Question
          </motion.button>
        </div>
      );
    }

    // --- SUCCESSFUL LIST RENDERING ---
    return (
      <>
        <CoupleAnimation />

        <div className="space-y-6 max-w-4xl mx-auto">
          {questions.map((q, index) => {
            const isRevealed = q._id === revealedAnswerId;
            return (
              <motion.div
                key={q._id}
                className="bg-white p-6 rounded-2xl shadow-xl border-l-8 border-pink-500 flex flex-col hover:shadow-2xl transition duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      {q.category} Quiz
                    </h3>
                    <h2 className="text-2xl font-extrabold text-gray-800 flex items-start">
                      <HelpCircle
                        size={24}
                        className="mr-3 text-purple-500 flex-shrink-0 mt-1"
                      />
                      {q.question}
                    </h2>
                  </div>

                  <motion.button
                    onClick={() => handleDelete(q._id)}
                    className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>

                {/* Answer Area */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isRevealed ? "auto" : 0,
                    opacity: isRevealed ? 1 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm font-bold text-green-700 mb-1">
                      Correct Answer:
                    </p>
                    <p className="text-base text-green-900 font-medium">
                      "{q.correctAnswer}"
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Generated on: {formatDate(q.createdAt)}
                    </p>
                  </div>
                </motion.div>

                {/* Reveal Button */}
                <motion.button
                  onClick={() => setRevealedAnswerId(isRevealed ? null : q._id)}
                  className={`mt-4 py-2 rounded-xl font-bold transition duration-200 shadow-sm 
                                    ${
                                      isRevealed
                                        ? "bg-gray-400 text-white"
                                        : "bg-pink-500 text-white hover:bg-pink-600"
                                    }`}
                  whileHover={{ scale: 1.03 }}
                >
                  {isRevealed ? "Hide Answer" : "Reveal Correct Answer"}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Background Glow (Reused from MoodMuse, using Pink/Purple) */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px at ${mousePosition.x * 20 + 50}% ${
            mousePosition.y * 20 + 50
          }%, rgba(103, 58, 183, 0.15) 0%, rgba(255, 255, 255, 0) 100%)`,
          transition: "background 0.3s ease-out",
        }}
      />

      <div className="relative z-10">
        {/* Header and Control Buttons */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky top-0 z-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            <span className="text-purple-600">Couple</span> Quiz
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
              onClick={() => navigate("/couple-quiz/generate")}
              className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <MessageSquare size={20} className="mr-1" />
              Generate New
            </motion.button>
          </div>
        </header>

        {/* Content Rendering */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ViewQuiz;
