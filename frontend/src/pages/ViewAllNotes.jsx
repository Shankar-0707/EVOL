// src/pages/ViewAllNotes.jsx (UPDATED for Soft Delete)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, Trash2, Loader2, BookOpen, MessageSquare, RotateCcw } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Ensure motion is imported
import API from '../utils/api';
import toast from 'react-hot-toast';

// Define the URL for your backend API
// const BASE_API_URL = 'http://localhost:5000/daily-notes'; 

const ViewAllNotes = () => {
    const navigate = useNavigate();
    
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH ALL NOTES FUNCTION (Remains the same) ---
    const fetchNotes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get(`/daily-notes/view`);
            // Assuming your backend returns data in response.data.allNotes
            setNotes(response.data.allNotes); 
        } catch (err) {
            console.error("Fetch Error:", err);
            const errorMessage = err.response?.data?.message || "Could not load notes. Check server.";
            setError(errorMessage);
            setNotes([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []); 

    // --- SOFT DELETE FUNCTION (Archives the note) ---
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to archive the note: "${title}"?`)) {
            return;
        }

        try {
            // DELETE request to the soft-delete endpoint
            await API.delete(`/daily-notes/delete/${id}`); 

            // Remove the note from the active list state immediately
            setNotes(notes.filter(note => note._id !== id));
            toast("Note moved to archive successfully! 📝");

        } catch (err) {
            console.error("Delete Error:", err);
            const errorMessage = err.response?.data?.message || "Failed to archive note.";
            toast.error(`Error: ${errorMessage}`);
        }
    };

    // --- Helper function to format the date ---
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    // --- RENDERING LOGIC ---
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
                <p className="text-lg">No active notes found yet! Time to write a new one.</p>
                <motion.button 
                    onClick={() => navigate('/daily-notes')}
                    className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Add Your First Note
                </motion.button>
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note, index) => (
                    <motion.div 
                        key={note._id} 
                        className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-pink-400 flex flex-col hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]"
                        initial={{ opacity: 0, y: 30 }} // Staggered entry animation
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{note.title}</h3>
                        
                        <p className="text-base text-gray-700 font-medium mb-1">
                            By: <span className="font-semibold text-pink-600">{note.madeby}</span>
                        </p>
                        
                        <p className="text-sm text-gray-500 mb-4">
                            {formatDate(note.createdAt)}
                        </p>
                        <p className="text-gray-700 leading-relaxed line-clamp-4 flex-grow">{note.content}</p>
                        
                        {/* Delete Button */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                             <motion.button
                                onClick={() => handleDelete(note._id, note.title)}
                                className="text-red-500 p-2 rounded-full hover:bg-red-100 transition duration-150"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={`Archive note titled ${note.title}`}
                             >
                                <Trash2 size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-pink-600">Active</span> Notes
                </h1>

                <div className="flex space-x-3">
                    {/* Back to Dashboard Button */}
                    <motion.button 
                        onClick={() => navigate('/')} 
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        Dashboard
                    </motion.button>
                    
                    {/* Add New Note Button */}
                    <motion.button 
                        onClick={() => navigate('/daily-notes')}
                        className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <MessageSquare size={20} className="mr-1" />
                        Add New Note
                    </motion.button>

                    {/* --- NEW BUTTON: VIEW DELETED NOTES --- */}
                    <motion.button 
                        onClick={() => navigate('/daily-notes/view-all-deleted-notes')}
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-gray-500 text-white hover:bg-gray-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <Trash2 size={20} className="mr-1" />
                        Deleted Notes
                    </motion.button>
                </div>
            </header>

            {/* Notes Grid Content */}
            {content}
            
        </div>
    );
};

export default ViewAllNotes;