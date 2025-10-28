// src/pages/ViewAllSongs.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, Trash2, Loader2, Music, Disc, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // <-- Import motion
import toast from "react-hot-toast";
import API from "../utils/api"; // Assuming this is your Axios instance

// Note: Using a relative path for the embed source will likely fail CORS/security checks.
// I will keep the base URL clean and let the iframe source handle the full Spotify URL.
const SPOTIFY_EMBED_BASE = "https://open.spotify.com/embed/track/";

const ViewAllSongs = () => {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);

  // --- HANDLER TO TOGGLE PLAYBACK ---
  const handlePlayToggle = (spotifyId) => {
    if (playingSongId === spotifyId) {
      setPlayingSongId(null);
    } else {
      setPlayingSongId(spotifyId);
    }
  };

  // --- FETCH ALL SONGS FUNCTION ---
  const fetchSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Corrected view path to match previous backend structure: /our-songs/view
      const response = await API.get(`/our-songs/viewsongs`); 
      setSongs(response.data.allSongs);
    } catch (err) {
      console.error("Fetch Error:", err);
      const errorMessage =
        err.response?.data?.message || "Could not load songs. Check server.";
      setError(errorMessage);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // --- SOFT DELETE SONG FUNCTION (Archives the song) ---
  // NOTE: We use song._id for deletion, not song.spotifyId, because Mongoose deletes by MongoDB ID.
  const handleDelete = async (mongoId, title) => {
    if (
      !window.confirm(
        `Are you sure you want to archive the song: "${title}"?`
      )
    ) {
      return;
    }

    try {
      // DELETE request to the soft-delete endpoint
      await API.delete(`/our-songs/delete/${mongoId}`); 

      // Update state: remove the deleted song immediately from the UI
      setSongs(songs.filter((song) => song._id !== mongoId));
      setPlayingSongId(null); // Stop playback if the current song is deleted
      
      toast.success("Song archived successfully! 🗑️", {
        iconTheme: { primary: "#ec4899", secondary: "#fff" },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to archive song.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // --- Helper function to format the date ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- RENDERING LOGIC ---
  let content;

  if (isLoading) {
    content = (
      <div className="text-center py-16 text-pink-500">
        <Loader2 size={32} className="mx-auto animate-spin mb-3" />
        <p className="text-lg font-medium">Loading your shared playlist...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
        <p className="text-xl font-semibold">Error:</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  } else if (songs.length === 0) {
    content = (
      <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
        <p className="text-lg">Your playlist is empty! Start adding songs.</p>
        <motion.button
          onClick={() => navigate("/our-songs/addsong")}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Songs Now
        </motion.button>
      </div>
    );
  } else {
    content = (
      <div className="space-y-6">
        {/* 🚨 CONDITIONAL SPOTIFY PLAYER 🚨 */}
        {playingSongId && (
          <div className="bg-gray-800 p-4 rounded-xl shadow-2xl sticky top-4 z-40">
            <h3 className="text-white text-lg font-bold mb-2">
              Now Playing...
          </h3>
            <iframe
              style={{ borderRadius: "12px" }}
              // Correctly form the Spotify embed URL with the track ID
              src={`${SPOTIFY_EMBED_BASE}${playingSongId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>

            <motion.button
              onClick={() => setPlayingSongId(null)}
              className="mt-2 text-sm text-gray-400 hover:text-white transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close Player
            </motion.button>
          </div>
        )}
        {/* ------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {songs.map((song, index) => (
            <motion.div
              key={song._id} // Use MongoDB ID for key
              className={`bg-white p-4 rounded-xl shadow-lg border-t-4 flex flex-col hover:shadow-xl transition duration-300 cursor-pointer 
                            ${
                              playingSongId === song.spotifyId
                                ? "border-purple-600 ring-4 ring-purple-300"
                                : "border-pink-400"
                            }`}
              onClick={() => handlePlayToggle(song.spotifyId)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                <img
                  src={song.imageUrl}
                  alt={`Album art for ${song.title}`}
                  className="w-full h-full object-cover"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                  <Music
                    size={48}
                    className="text-white bg-pink-500 p-2 rounded-full"
                  />
                </div>
              </div>

              <div className="flex-grow">
                <p className="text-xl font-bold text-gray-800 line-clamp-1">
                  {song.title}
                </p>
                <p className="text-base text-gray-600 mb-2 line-clamp-1 flex items-center">
                  <Disc size={16} className="mr-1 text-purple-500" />
                  {song.artist}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Added By:
                  <span className="font-medium text-pink-600">
                    {song.addedBy}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  On: {formatDate(song.addedAt)}
                </p>
              </div>

              {/* Delete Button (Soft Delete) */}
              <div
                className="mt-4 pt-3 border-t border-gray-100 flex justify-end"
                onClick={(e) => e.stopPropagation()} // Prevent card click event
              >
                <motion.button
                  onClick={() => handleDelete(song._id, song.title)} // Use MongoDB _id for soft delete
                  className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Archive ${song.title}`}
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header and Control Buttons */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span className="text-pink-600">Active</span> Songs
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
          
          {/* Add New Song Button (assuming route /add-songs) */}
          <motion.button
            onClick={() => navigate("/our-songs/addsong")}
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <Music size={20} className="mr-1" />
            Add New Song
          </motion.button>
            
            {/* --- NEW BUTTON: VIEW DELETED SONGS --- */}
            <motion.button 
                onClick={() => navigate('/our-songs/view-all-deleted-songs')}
                className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-gray-500 text-white hover:bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
            >
                <Trash2 size={20} className="mr-1" />
                Deleted Songs
            </motion.button>
        </div>
      </header>

      {/* Songs Grid Content */}
      {content}
    </div>
  );
};

export default ViewAllSongs;