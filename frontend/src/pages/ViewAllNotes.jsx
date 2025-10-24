// src/pages/ViewAllNotes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { ChevronLeft, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Define the URL for your backend API
const BASE_API_URL = "https://evol-k431.onrender.com/daily-notes";

const ViewAllNotes = () => {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 🚨 AXIOS FETCH FUNCTION 🚨 ---
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use axios.get()
      const response = await axios.get(`${BASE_API_URL}/view`);

      // Axios automatically handles JSON parsing and throws an error for 4xx/5xx status codes.
      // Assuming your backend returns data in response.data.allNotes (based on your controller)
      setNotes(response.data.allNotes);
    } catch (err) {
      console.error("Fetch Error:", err);
      // Check for a specific error message from the backend response
      const errorMessage =
        err.response?.data?.message || "Could not load notes. Check server.";
      setError(errorMessage);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // --- AXIOS DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      // Use axios.delete()
      console.log("Calling delete for:", id);
      await axios.delete(`${BASE_API_URL}/delete/${id}`);

      // Remove the note from the state immediately
      setNotes(notes.filter((note) => note._id !== id));
      toast.success("Note deleted successfully!🗑️", {
        iconTheme: {
          primary: "#ec4899", // pink-500 color
          secondary: "#fff", // icon ke andar ka color
        },
      });
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete note.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // --- Helper function to format the date ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- RENDERING LOGIC (same as before) ---
  let content;

  if (isLoading) {
    content = (
      <div className="text-center py-16 text-pink-500">
        <Loader2 size={32} className="mx-auto animate-spin mb-3" />
        <p className="text-lg font-medium">Loading your precious notes...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="text-center py-16 text-red-500 bg-red-100 p-6 rounded-xl border border-red-300">
        <p className="text-xl font-semibold">Error:</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  } else if (notes.length === 0) {
    content = (
      <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
        <p className="text-lg">No notes found yet! Time to write a new one.</p>
        <button
          onClick={() => navigate("/daily-notes")}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
        >
          Add Your First Note
        </button>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400 flex flex-col hover:shadow-xl transition duration-300"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {note.title}
            </h3>
            {/* 🚨 NEW FIELD: Displaying the creator (madeby) 🚨 */}
            <p className="text-base text-gray-700 font-medium mb-1">
              By:{" "}
              <span className="font-semibold text-pink-600">{note.madeby}</span>
            </p>
            {/* END NEW FIELD */}
            <p className="text-sm text-pink-500 mb-4">
              {formatDate(note.createdAt)}
            </p>
            <p className="text-gray-700 leading-relaxed line-clamp-4 flex-grow">
              {note.content}
            </p>

            {/* Delete Button */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleDelete(note._id)}
                className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                aria-label={`Delete note titled ${note.title}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header and Control Buttons */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span className="text-pink-600">All</span> Notes
        </h1>

        <div className="flex space-x-3">
          {/* Back to Add Note Button */}
          <button
            onClick={() => navigate("/daily-notes")}
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
            disabled={isLoading}
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Add Note
          </button>
        </div>
      </header>

      {/* Notes Grid Content */}
      {content}
    </div>
  );
};

export default ViewAllNotes;
