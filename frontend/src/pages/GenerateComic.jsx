// src/pages/GenerateComic.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import {
  ChevronLeft,
  MessageSquare,
  Loader2,
  Heart,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// const BASE_API_URL = "https://evol-k431.onrender.com/couple-comics";

const GenerateComic = () => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!theme.trim()) {
      alert("Please enter a key moment or theme.");
      return;
    }
    setIsLoading(true);

    try {
      const payload = { theme: theme.trim() };

      await API.post(`/couple-comics/generate`, payload);

      toast.success(`Comic strip generated and saved successfully!`, {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });

      setTheme("");

      // Navigate to the view page after successful generation
      navigate("/couple-comics/generate");
    } catch (err) {
      console.error("AI Generation Error:", err);
      const message =
        err.response?.data?.message ||
        "Failed to generate comic. Check Gemini API key.";
      toast.error(`Generation Failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header and Control Buttons */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span className="text-red-600">Generate</span> Comic
        </h1>

        <div className="flex space-x-3">
          {/* Back to Dashboard Button */}
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </motion.button>

          {/* View Comics Button */}
          <motion.button
            onClick={() => navigate("/couple-comics/view")}
            className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-red-500 text-white hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <BookOpen size={20} className="mr-1" />
            View Comics
          </motion.button>
        </div>
      </header>

      {/* Main Content: Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-red-600 mb-6 flex items-center">
          <Sparkles size={28} className="mr-3" />
          Comic Strip Creator
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="theme"
              className="block text-gray-700 font-bold mb-2"
            >
              Key Moment / Comic Theme
            </label>
            <textarea
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., The time we cooked dinner and the smoke alarm went off, or, The first time we adopted a pet."
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Be specific! The AI will turn this into a short, romantic comic
              strip dialogue.
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-4 bg-red-600 text-white font-extrabold text-xl rounded-xl hover:bg-red-700 transition duration-200 shadow-lg disabled:bg-red-300 flex items-center justify-center"
            disabled={isLoading || !theme}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-3" />
                Drawing Up Dialogue...
              </>
            ) : (
              <>
                <Heart size={24} className="mr-3" />
                Generate Comic Strip
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default GenerateComic;
