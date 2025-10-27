// src/pages/ViewDeletedComics.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Loader2, RotateCcw, XCircle, BookOpen } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import API from "../utils/api";
import toast from 'react-hot-toast';

// const BASE_API_URL = 'http://localhost:5000/couple-comics';

const DeleteConfirmationModal = ({ comic, onClose, onPermanentDelete }) => {
    // Only render the modal if a comic object is passed
    if (!comic) return null;
    
    // Framer Motion variants for the modal container
    const modalVariants = {
        hidden: { opacity: 0, y: -50, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 50, scale: 0.8 },
    };

    return (
        <motion.div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // Close when clicking the overlay
        >
            <motion.div
                className="bg-white p-6 rounded-2xl shadow-2xl max-w-3xl w-full"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-2xl font-extrabold text-red-600">Review Deleted Comic</h3>
                    <motion.button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 transition"
                        whileHover={{ rotate: 90 }}
                    >
                        <XCircle size={24} />
                    </motion.button>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">{comic.comicTitle}</h2>
                
                {/* Comic Panel Grid Display */}
                <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                    {comic.panels.map((panel, panelIndex) => (
                        <motion.div
                            key={panelIndex}
                            className="border border-red-300 rounded-lg p-3 bg-red-50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: panelIndex * 0.1 }}
                        >
                            <p className="text-xs font-bold text-red-500 mb-1">PANEL {panel.panelNumber}</p>
                            <p className="text-xs italic text-gray-600 mb-2">Setting: {panel.setting}</p>
                            <p className="text-base font-semibold text-gray-800">"{panel.dialogue}"</p>
                        </motion.div>
                    ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Archived on: {new Date(comic.deletedAt).toLocaleDateString()}
                    </p>
                    <motion.button
                        // Pass the function to the main component's permanent delete handler
                        onClick={() => onPermanentDelete(comic._id)} 
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

const ViewDeletedComics = () => {
    const navigate = useNavigate();
    
    const [deletedComics, setDeletedComics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedComic, setSelectedComic] = useState(null);

    // --- FETCH DELETED COMICS FUNCTION ---
    const fetchDeletedComics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // GET request to the new view deleted endpoint
            const response = await API.get(`/couple-comics/view-all-deleted-comics`); 
            setDeletedComics(response.data.deletedComics); 
        } catch (err) {
            console.error("Fetch Deleted Error:", err);
            setError("Could not load deleted comics.");
            setDeletedComics([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedComics();
    }, []); 

    // --- PERMANENT DELETE FUNCTION ---
    const handlePermanentDelete = async (id) => {
        if (!window.confirm("WARNING: Are you absolutely sure you want to permanently delete this comic? This cannot be undone.")) {
            return;
        }

        try {
            // DELETE request to the new permanent delete endpoint
            await API.delete(`/couple-comics/permanently-delete/${id}`); 
            
            // Remove from state immediately
            setDeletedComics(deletedComics.filter(comic => comic._id !== id));
            setSelectedComic(null); // Close the modal
            toast("Comic permanently erased! 💀");

        } catch (err) {
            console.error("Permanent Delete Error:", err);
            const errorMessage = err.response?.data?.message || "Failed to permanently delete comic.";
            toast(`Error: ${errorMessage}`);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    // --- RENDERING LOGIC ---
    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="text-center py-16 text-red-500">
                    <Loader2 size={32} className="mx-auto animate-spin mb-3" />
                    <p className="text-lg font-medium">Loading deleted comic strips...</p>
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
        
        if (deletedComics.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-lg">The trash is empty! Nothing has been deleted.</p>
                    <motion.button 
                        onClick={() => navigate('/couple-comics/view')}
                        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        whileHover={{ scale: 1.05 }}
                    >
                        <RotateCcw size={20} className="mr-1"/> Go Back to Comics
                    </motion.button>
                </div>
            );
        }

        // --- SUCCESSFUL LIST RENDERING ---
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <p className="text-sm text-red-600 font-semibold flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle size={16} className="mr-2"/> These comics are archived. Click any card to review and permanently delete.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deletedComics.map((comic, index) => (
                        <motion.div 
                            key={comic._id} 
                            // --- CLICK HANDLER TO OPEN MODAL ---
                            onClick={() => setSelectedComic(comic)}
                            className="bg-white p-4 rounded-2xl shadow-xl border-l-8 border-gray-400 opacity-80 cursor-pointer hover:opacity-100 transition duration-200 transform hover:translate-y-[-2px]"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{comic.comicTitle}</h3>
                                    <p className="text-xs text-gray-500 mb-1">Theme: {comic.theme}</p>
                                    <p className="text-xs text-red-400">Archived: {formatDate(comic.deletedAt)}</p>
                                </div>
                                <BookOpen size={28} className="text-gray-500 flex-shrink-0"/>
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
                    <span className="text-red-600">Deleted</span> Comics
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
                    
                    {/* Back to Active Comics Button */}
                    <motion.button 
                        onClick={() => navigate('/couple-comics/view')}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition duration-150 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <Trash2 size={20} className="mr-1" />
                        Active Comics
                    </motion.button>
                </div>
            </header>

            {/* Content Rendering */}
            {renderContent()}

            {/* --- RENDER THE MODAL WITH ANIMATEPRESENCE --- */}
            {/* AnimatePresence is essential for the exit animation of the modal */}
            <AnimatePresence>
                {selectedComic && (
                    <DeleteConfirmationModal
                        comic={selectedComic}
                        onClose={() => setSelectedComic(null)}
                        onPermanentDelete={handlePermanentDelete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ViewDeletedComics;