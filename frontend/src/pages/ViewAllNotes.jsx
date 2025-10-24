// src/pages/ViewAllNotes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { ChevronLeft, Trash2, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../utils/api";


// Define the URL for your backend API
// const BASE_API_URL = "https://evol-k431.onrender.com/daily-notes";
// const BASE_API_URL = "http://localhost:5000/daily-notes";

const ViewAllNotes = () => {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // --- 🚨 AXIOS FETCH FUNCTION 🚨 ---
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use axios.get()
      const response = await API.get(`/daily-notes/view`);

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

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isPopupOpen) {
        closeNotePopup();
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

  // --- AXIOS DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      // Use axios.delete()
      console.log("Calling delete for:", id);
      await API.delete(`/daily-notes/delete/${id}`);

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

  // --- Popup functions ---
  const openNotePopup = (note) => {
    setSelectedNote(note);
    setIsPopupOpen(true);
  };

  const closeNotePopup = () => {
    setSelectedNote(null);
    setIsPopupOpen(false);
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
            className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400 flex flex-col hover:shadow-xl transition duration-300 cursor-pointer"
            onClick={() => openNotePopup(note)}
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
           <div className="text-gray-700 leading-relaxed max-h-32 overflow-y-auto pr-2 mb-4 flex-grow">
             {note.content}
           </div>

            {/* Delete Button */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent popup from opening when clicking delete
                  handleDelete(note._id);
                }}
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

      {/* Note Popup Modal */}
      {isPopupOpen && selectedNote && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeNotePopup}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedNote.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-medium">
                    By: <span className="text-pink-600 font-semibold">{selectedNote.madeby}</span>
                  </span>
                  <span>•</span>
                  <span>{formatDate(selectedNote.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={closeNotePopup}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150"
                aria-label="Close popup"
              >
                <X size={24} />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </div>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  handleDelete(selectedNote._id);
                  closeNotePopup();
                }}
                className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition duration-150 font-medium"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllNotes;
