// src/pages/ViewGallery.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UploadCloud, Trash2, Loader2, Heart } from "lucide-react";
import toast from "react-hot-toast";


import { motion, useSpring, useTransform } from "framer-motion";

const BASE_API_URL = "https://evol-k431.onrender.com/our-gallery";

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

const ViewGallery = () => {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mousePosition = useMousePosition();

  // --- FETCH ALL PHOTOS FUNCTION ---
  const fetchPhotos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_API_URL}/view-gallery`);
      // response.data.allPhotos now contains the Base64 image URL
      setPhotos(response.data.allPhotos);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Could not load photos. Check server.");
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // --- DELETE PHOTO FUNCTION ---
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this photo forever?")
    ) {
      return;
    }

    try {
      // Delete request uses MongoDB's _id
      await axios.delete(`${BASE_API_URL}/delete-photo/${id}`);
      setPhotos(photos.filter((photo) => photo._id !== id));
      toast.success("Photo deleted successfully!", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete photo.";
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
  // ... (Your loading, error, and no photos logic remains the same) ...

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 text-teal-500">
          <Loader2 size={32} className="mx-auto animate-spin mb-3" />
          <p className="text-lg font-medium">
            Loading your beautiful gallery...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
          <p className="text-xl font-semibold">Error:</p>
          <p className="mt-2">{error}</p>
        </div>
      );
    }

    if (photos.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          <p className="text-lg">The gallery is empty! Start uploading.</p>
          <motion.button
            onClick={() => navigate("/add-gallery")}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add First Photo
          </motion.button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* 🚨 SUBTLE GRADIENT BACKGROUND GLOW 🚨 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          // Use Teal color for the gallery's theme
          background: `radial-gradient(400px at ${mousePosition.x * 20 + 50}% ${
            mousePosition.y * 20 + 50
          }%, rgba(0, 150, 136, 0.15) 0%, rgba(255, 255, 255, 0) 100%)`,
          transition: "background 0.3s ease-out",
        }}
      />

      <div className="relative z-10">
        {/* Header and Control Buttons */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky top-0 z-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            <span className="text-teal-600">Our</span> Gallery
          </h1>

          <div className="flex space-x-3">
            {/* Back to Dashboard Button */}
            <motion.button
              onClick={() => navigate("/our-gallery/upload-photo")}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </motion.button>
            {/* Back to Add Photo Button */}
            <motion.button
              onClick={() => navigate("/add-gallery")}
              className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition duration-150 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <UploadCloud size={20} className="mr-1" />
              Add New Photo
            </motion.button>
          </div>
        </header>

        {/* Couple Animation */}
        {!isLoading && !error && photos.length > 0 && <CoupleAnimation />}

        {/* Photos Grid Content */}
        {isLoading ? (
          <div className="text-center py-16 text-teal-500">
            <Loader2 size={32} className="mx-auto animate-spin mb-3" />
            <p className="text-lg font-medium">Fetching beautiful moments...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
            <p className="text-lg">The gallery is empty! Start uploading.</p>
            <button
              onClick={() => navigate("/our-gallery/upload-photo")}
              className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
            >
              Add First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition duration-300 transform hover:scale-[1.02]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.05 * index,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <div className="relative w-full h-64">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white text-lg font-semibold line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    By:{" "}
                    <span className="font-semibold text-teal-600">
                      {photo.uploadedBy}
                    </span>{" "}
                    on {formatDate(photo.uploadedAt)}
                  </p>
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                    aria-label={`Delete photo ${photo.caption}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewGallery;
