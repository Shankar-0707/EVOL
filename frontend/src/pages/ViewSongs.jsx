// src/pages/ViewAllSongs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, Trash2, Loader2, Music, Disc } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = "https://evol-k431.onrender.com/our-songs";

const ViewAllSongs = () => {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- NEW STATE: Tracks the Spotify ID of the song currently selected to play ---
  const [playingSongId, setPlayingSongId] = useState(null);

  // --- HANDLER TO TOGGLE PLAYBACK ---
  const handlePlayToggle = (spotifyId) => {
    // If the same song is clicked, stop playback (set to null)
    if (playingSongId === spotifyId) {
      setPlayingSongId(null);
    } else {
      // Otherwise, start playing the new song
      setPlayingSongId(spotifyId);
    }
  };

  // --- FETCH ALL SONGS FUNCTION ---
  const fetchSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // GET request to /our-songs/view
      const response = await axios.get(`${BASE_API_URL}/viewsongs`);

      // Assuming the backend returns { allSongs: [...] }
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

  // --- DELETE SONG FUNCTION ---
  const handleDelete = async (spotifyId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this song from your collection?"
      )
    ) {
      return;
    }

    try {
      // DELETE request to /our-songs/delete/:id
      await axios.delete(`${BASE_API_URL}/delete/${spotifyId}`);

      // Update state: remove the deleted song immediately from the UI
      setSongs(songs.filter((song) => song.spotifyId !== spotifyId));
      alert("Song deleted successfully! 🗑️");
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete song.";
      alert(`Error: ${errorMessage}`);
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
        <button
          onClick={() => navigate("/our-songs/addsong")}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
        >
          Add Songs Now
        </button>
      </div>
    );
  } else {
    content = (
      <div className="space-y-6">
        {" "}
        {/* Change outer grid to space-y for consistent player width */}
        {/* 🚨 NEW: CONDITIONAL SPOTIFY PLAYER 🚨 */}
        {playingSongId && (
          <div className="bg-gray-800 p-4 rounded-xl shadow-2xl sticky top-4 z-40">
            <h3 className="text-white text-lg font-bold mb-2">
              Now Playing...
            </h3>
            {/* The standard Spotify Embed URL uses the track ID */}
            <iframe
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${playingSongId}`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>

            <button
              onClick={() => setPlayingSongId(null)}
              className="mt-2 text-sm text-gray-400 hover:text-white transition"
            >
              Close Player
            </button>
          </div>
        )}
        {/* ------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {songs.map((song) => (
            <div
              key={song.spotifyId}
              className={`bg-white p-4 rounded-xl shadow-lg border-t-4 flex flex-col hover:shadow-xl transition duration-300 cursor-pointer 
                                ${
                                  playingSongId === song.spotifyId
                                    ? "border-purple-600 ring-4 ring-purple-300"
                                    : "border-pink-400"
                                }`}
              onClick={() => handlePlayToggle(song.spotifyId)} // <-- ADDED HANDLER
            >
              <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                <img
                  src={song.imageUrl}
                  alt={`Album art for ${song.title}`}
                  className="w-full h-full object-cover"
                />
                {/* Add a play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                  <Music
                    size={48}
                    className="text-white bg-pink-500 p-2 rounded-full"
                  />
                </div>
              </div>

              <div className="flex-grow">
                {/* ... (Song details: title, artist, addedBy, date remain the same) ... */}
                <p className="text-xl font-bold text-gray-800 line-clamp-1">
                  {song.title}
                </p>
                <p className="text-base text-gray-600 mb-2 line-clamp-1 flex items-center">
                  <Disc size={16} className="mr-1 text-purple-500" />{" "}
                  {song.artist}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Added By:{" "}
                  <span className="font-medium text-pink-600">
                    {song.addedBy}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  On: {formatDate(song.addedAt)}
                </p>
              </div>

              {/* Delete Button (Keep separate from the main click event) */}
              <div
                className="mt-4 pt-3 border-t border-gray-100 flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleDelete(song.spotifyId)}
                  className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                  aria-label={`Remove ${song.title} from collection`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
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
          <span className="text-pink-600">Our</span> Songs
        </h1>

        <div className="flex space-x-3">
          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate("/our-songs/addsong")}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
            disabled={isLoading}
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </button>
          {/* Back to Add Songs Button */}
          <button
            onClick={() => navigate("/add-songs")}
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
            disabled={isLoading}
          >
            <Music size={20} className="mr-1" />
            Add New Song
          </button>
        </div>
      </header>

      {/* Songs Grid Content */}
      {content}
    </div>
  );
};

export default ViewAllSongs;
