// src/pages/ViewDeletedMoodMuse.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Loader2, RotateCcw, XCircle, Sparkles, BookOpen, MessageSquare } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import API from '../utils/api';
import toast from 'react-hot-toast';

// const BASE_API_URL = 'http://localhost:5000/mood-muse';

// --- MODAL COMPONENT ---
const MuseReviewModal = ({ entry, onClose, onPermanentDelete }) => {
    if (!entry) return null;
    
    const modalVariants = {
        hidden: { opacity: 0, y: -50, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 50, scale: 0.8 },
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
                className="bg-white p-6 rounded-2xl shadow-2xl max-w-xl w-full"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-2xl font-extrabold text-purple-600">Review Deleted Muse</h3>
                    <motion.button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition" whileHover={{ rotate: 90 }}>
                        <XCircle size={24} />
                    </motion.button>
                </div>

                <p className="text-sm font-medium text-pink-600 mb-2">Mood: {entry.mood} | Type: {entry.promptType}</p>
                
                {/* Content Display */}
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif bg-gray-50 p-4 rounded-lg border-l-2 border-pink-300 max-h-80 overflow-y-auto">
                    {entry.generatedContent}
                </pre>

                <p className="text-sm text-gray-400 mt-4">
                    Original Date: {formatDate(entry.createdAt)}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                    Archived on: {formatDate(entry.deletedAt)}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <motion.button
                        onClick={() => onPermanentDelete(entry._id)}
                        className="px-4 py-2 bg-red-700 text-white font-medium rounded-xl hover:bg-red-800 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Trash2 size={16} className="inline mr-1"/> Yes, Permanently Delete
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const ViewDeletedMoodMuse = () => {
    const navigate = useNavigate();
    
    const [deletedEntries, setDeletedEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null); 

    // --- FETCH DELETED ENTRIES FUNCTION ---
    const fetchDeletedEntries = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get(`/mood-muse/view-all-deleted-entries`); 
            setDeletedEntries(response.data.deletedEntries); 
        } catch (err) {
            console.error("Fetch Deleted Error:", err);
            setError("Could not load deleted history.");
            setDeletedEntries([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedEntries();
    }, []); 

    // --- PERMANENT DELETE FUNCTION ---
    const handlePermanentDelete = async (id) => {
        try {
            await API.delete(`/mood-muse/permanently-delete/${id}`); 
            setDeletedEntries(deletedEntries.filter(entry => entry._id !== id));
            setSelectedEntry(null); // Close the modal
            toast("Entry permanently erased! 💀");

        } catch (err) {
            console.error("Permanent Delete Error:", err);
            const errorMessage = err.response?.data?.message || "Failed to permanently delete entry.";
            toast(`Error: ${errorMessage}`);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // --- RENDERING LOGIC ---
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
        
        if (deletedEntries.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-lg">The trash is empty! Nothing has been deleted.</p>
                    <motion.button 
                        onClick={() => navigate('/mood-muse/view')}
                        className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RotateCcw size={20} className="inline mr-1"/> Go Back to Active Muse
                    </motion.button>
                </div>
            );
        }

        // --- SUCCESSFUL LIST RENDERING ---
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <p className="text-sm text-red-600 font-semibold flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle size={16} className="mr-2"/> These entries are archived. Click to review and permanently delete.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deletedEntries.map((entry, index) => (
                        <motion.div 
                            key={entry._id} 
                            onClick={() => setSelectedEntry(entry)}
                            className="bg-white p-4 rounded-2xl shadow-xl border-l-8 border-gray-400 opacity-80 cursor-pointer hover:opacity-100 transition duration-200 transform hover:translate-y-[-2px]"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{entry.promptType}</h3>
                                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">Mood: {entry.mood}</p>
                                    <p className="text-xs text-red-400">Archived: {formatDate(entry.deletedAt)}</p>
                                </div>
                                <MessageSquare size={28} className="text-gray-500 flex-shrink-0"/>
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
                    <span className="text-purple-600">Deleted</span> History
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
                    
                    {/* Back to Active Muse Button */}
                    <motion.button 
                        onClick={() => navigate('/mood-muse/view')}
                        className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition duration-150 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <Sparkles size={20} className="mr-1" />
                        Active Muse
                    </motion.button>
                </div>
            </header>

            {/* Content Rendering */}
            {renderContent()}

            {/* --- RENDER THE MODAL --- */}
            <AnimatePresence>
                {selectedEntry && (
                    <MuseReviewModal
                        entry={selectedEntry}
                        onClose={() => setSelectedEntry(null)}
                        onPermanentDelete={handlePermanentDelete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ViewDeletedMoodMuse;