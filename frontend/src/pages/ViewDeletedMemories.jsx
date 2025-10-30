// src/pages/ViewDeletedMemories.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  RotateCcw,
  XCircle,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import toast from "react-hot-toast";

// const BASE_API_URL = 'http://localhost:5000/our-memories';

// --- MODAL COMPONENT ---
const MemoryReviewModal = ({ memory, onClose, onPermanentDelete }) => {
  if (!memory) return null;

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.8 },
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-2xl font-extrabold text-purple-600">
            Review Deleted Memory
          </h3>
          <motion.button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            whileHover={{ rotate: 90 }}
          >
            <XCircle size={24} />
          </motion.button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">{memory.title}</h2>

        {/* Content Details */}
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-pink-400 mb-4 max-h-60 overflow-y-auto">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif italic">
            "{memory.description}"
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Occasion Date:{" "}
          <span className="font-semibold text-pink-600">
            {new Date(memory.date).toLocaleDateString()}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Added by:{" "}
          <span className="font-semibold text-purple-600">
            {memory.addedBy}
          </span>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Archived on: {formatDate(memory.deletedAt)}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          {/* --- RESTORE BUTTON IN MODAL --- */}
          <motion.button
            onClick={() => onRestore(memory._id)} // Call restore handler
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={16} className="inline mr-1" /> Restore
          </motion.button>

          <motion.button
            onClick={() => onPermanentDelete(memory._id)}
            className="px-4 py-2 bg-red-700 text-white font-medium rounded-xl hover:bg-red-800 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} className="inline mr-1" /> Yes, Permanently Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const ViewDeletedMemories = () => {
  const navigate = useNavigate();

  const [deletedMemories, setDeletedMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  // --- NEW RESTORE HANDLER ---
  const handleRestore = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to RESTORE this memory to the active list?"
      )
    ) {
      return;
    }

    try {
      await API.post(`/our-memories/restore/${id}`);

      // Remove the restored item from the deleted list state immediately
      setDeletedMemories(deletedMemories.filter((memory) => memory._id !== id));

      setSelectedMemory(null); // Close the modal

      toast.success(
        "Memory successfully restored! Redirecting to active memories..."
      );
      navigate("/our-memories/view-memories"); // Navigate to the active view page
    } catch (err) {
      console.error("Restore Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to restore memory.";
      alert(`Error: ${errorMessage}`);
    }
  };

  // --- FETCH DELETED MEMORIES FUNCTION ---
  const fetchDeletedMemories = async () => {
    /* ... implementation ... */
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/our-memories/view-all-deleted-memories`);
      setDeletedMemories(response.data.deletedMemories);
    } catch (err) {
      console.error("Fetch Deleted Error:", err);
      setError("Could not load deleted memories.");
      setDeletedMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedMemories();
  }, []);

  // --- PERMANENT DELETE FUNCTION ---
  const handlePermanentDelete = async (id) => {
    try {
      await API.delete(`/our-memories/permanently-delete/${id}`);
      setDeletedMemories(deletedMemories.filter((memory) => memory._id !== id));
      setSelectedMemory(null); // Close the modal
      toast("Memory permanently erased! 💀");
    } catch (err) {
      console.error("Permanent Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to permanently delete memory.";
      toast(`Error: ${errorMessage}`);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // --- RENDERING LOGIC ---
  const renderContent = () => {
    // ... (Loading, error, empty state logic) ...
    if (isLoading) {
      return (
        <div className="text-center py-16 text-pink-500">
          <Loader2 size={32} className="mx-auto animate-spin mb-3" />
          <p className="text-lg font-medium">Summoning the muse...</p>
        </div>
      );
    }

    if (error) {
      // ... Error display
      return (
        <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
          <p className="text-xl font-semibold">Error:</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }

    if (deletedMemories.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">
            The trash is empty! Nothing has been deleted.
          </p>
          <motion.button
            onClick={() => navigate("/our-memories/view-memories")}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} className="inline mr-1" /> Go Back to Active
            Memories
          </motion.button>
        </div>
      );
    }

    // --- SUCCESSFUL LIST RENDERING ---
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <p className="text-sm text-red-600 font-semibold flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle size={16} className="mr-2" /> These memories are archived.
          Click to review and permanently delete.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deletedMemories.map((memory, index) => (
            <motion.div
              key={memory._id}
              onClick={() => setSelectedMemory(memory)} // Open modal on click
              className="bg-white p-4 rounded-2xl shadow-xl border-l-8 border-gray-400 opacity-80 cursor-pointer hover:opacity-100 transition duration-200 transform hover:translate-y-[-2px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {memory.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                    By: {memory.addedBy}
                  </p>
                  <p className="text-xs text-red-400">
                    Archived: {formatDate(memory.deletedAt)}
                  </p>
                </div>
                <BookOpen size={28} className="text-gray-500 flex-shrink-0" />
              </div>

              {/* --- Restore Button on Card --- */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(memory._id);
                  }} // Restore on card click
                  className="px-3 py-1 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition duration-150"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={16} className="inline mr-1" /> Restore
                </motion.button>

                {/* Delete button (Opens Modal) */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMemory(memory);
                  }}
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
      </div>
    );
  };

  return (
    <div className="min-h-full">
      {/* Header and Control Buttons */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span className="text-purple-600">Deleted</span> Memories
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
            <ChevronLeft size={20} className="mr-1" /> Dashboard
          </motion.button>

          {/* Back to Active Memories Button */}
          <motion.button
            onClick={() => navigate("/our-memories/view-memories")}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <BookOpen size={20} className="mr-1" /> Active Memories
          </motion.button>
        </div>
      </header>

      {/* Content Rendering */}
      {renderContent()}

      {/* --- RENDER THE MODAL --- */}
      <AnimatePresence>
        {selectedMemory && (
          <MemoryReviewModal
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewDeletedMemories;
