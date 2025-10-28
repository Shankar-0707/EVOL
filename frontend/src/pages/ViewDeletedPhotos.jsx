// src/pages/ViewDeletedPhotos.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  Loader2,
  RotateCcw,
  XCircle,
  Camera,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import toast from "react-hot-toast";

// const BASE_API_URL = 'http://localhost:5000/our-gallery';

// --- MODAL COMPONENT ---
const PhotoReviewModal = ({ photo, onClose, onPermanentDelete }) => {
  if (!photo) return null;

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
        className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-2xl font-extrabold text-teal-600">
            Review Deleted Photo
          </h3>
          <motion.button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            whileHover={{ rotate: 90 }}
          >
            <XCircle size={24} />
          </motion.button>
        </div>

        <div className="w-full h-80 rounded-xl overflow-hidden mb-4 border border-gray-200">
          {/* Display the Base64 image URL */}
          <img
            src={photo.imageUrl}
            alt={photo.caption}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {photo.caption}
        </h2>

        <p className="text-sm text-gray-500">
          Original Uploader:{" "}
          <span className="font-semibold text-teal-600">
            {photo.uploadedBy}
          </span>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Archived on: {formatDate(photo.deletedAt)}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <motion.button
            onClick={() => onPermanentDelete(photo._id)}
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
const ViewDeletedPhotos = () => {
  const navigate = useNavigate();

  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // --- FETCH DELETED PHOTOS FUNCTION ---
  const fetchDeletedPhotos = async () => {
    /* ... implementation ... */
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/our-gallery/view-all-deleted-photos`);
      setDeletedPhotos(response.data.deletedPhotos);
    } catch (err) {
      console.error("Fetch Deleted Error:", err);
      setError("Could not load deleted photos.");
      setDeletedPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedPhotos();
  }, []);

  // --- PERMANENT DELETE FUNCTION ---
  const handlePermanentDelete = async (id) => {
    try {
      await API.delete(`/our-gallery/permanently-delete/${id}`);
      setDeletedPhotos(deletedPhotos.filter((photo) => photo._id !== id));
      setSelectedPhoto(null); // Close the modal
      toast("Photo permanently erased! 💀");
    } catch (err) {
      console.error("Permanent Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to permanently delete photo.";
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

  const renderContent = () => {
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

    if (deletedPhotos.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">
            The trash is empty! Nothing has been deleted.
          </p>
          <motion.button
            onClick={() => navigate("/our-gallery/view-gallery")}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} className="inline mr-1" /> Go Back to Active
            Gallery
          </motion.button>
        </div>
      );
    }

    // --- SUCCESSFUL LIST RENDERING ---
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <p className="text-sm text-red-600 font-semibold flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle size={16} className="mr-2" /> These photos are archived.
          Click to review and permanently delete.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedPhotos.map((photo, index) => (
            <motion.div
              key={photo._id}
              onClick={() => setSelectedPhoto(photo)} // Open modal on click
              className="bg-white p-4 rounded-2xl shadow-xl border-l-8 border-gray-400 opacity-80 cursor-pointer hover:opacity-100 transition duration-200 transform hover:translate-y-[-2px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow pr-2">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {photo.caption}
                  </h3>
                  <p className="text-xs text-red-400">
                    Archived: {formatDate(photo.deletedAt)}
                  </p>
                </div>
                <Camera size={28} className="text-gray-500 flex-shrink-0" />
              </div>
              <div className="w-full h-32 mt-3 rounded-lg overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
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
          <span className="text-teal-600">Deleted</span> Photos
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

          {/* Back to Active Gallery Button */}
          <motion.button
            onClick={() => navigate("/our-gallery/view-gallery")}
            className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <Camera size={20} className="mr-1" /> Active Gallery
          </motion.button>
        </div>
      </header>

      {/* Content Rendering */}
      {renderContent()}

      {/* --- RENDER THE MODAL --- */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoReviewModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewDeletedPhotos;
