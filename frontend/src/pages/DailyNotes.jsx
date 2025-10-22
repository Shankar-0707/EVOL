// src/pages/DailyNotes.jsx (REVISED for external routing)
import React, { useState } from 'react';
import { ChevronLeft, ListChecks } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

// Define the URL for your backend API
const API_URL = 'https://evol-k431.onrender.com/daily-notes/add'; 

const DailyNotes = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [madeby, setMadeby] = useState('');
    // const [view, setView] = useState('ADD'); // <-- REMOVED: No longer needed
    const [isLoading, setIsLoading] = useState(false); 
    
    const navigate = useNavigate();

    // --- 🚨 API INTEGRATION FUNCTION 🚨 ---
    const handleAddNote = async (e) => {
        e.preventDefault(); 
        
        if (!title.trim() || !content.trim() || !madeby.trim()) { 
            alert("Please ensure all fields (title, content, and creator) are filled.");
            return;
        }
        
        setIsLoading(true); 

        const newNoteData = {
            title: title.trim(),
            content: content.trim(),
            madeby: madeby.trim(),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNoteData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed with status: ${response.status}`);
            }

            // 4. Show success alert
            alert("Note added successfully! 🎉");

            // 5. Clear the form 
            setTitle('');
            setContent('');
            
            // 6. **NEW ACTION**: Navigate to the ViewAllNotes page immediately
            navigate('/daily-notes'); 
            
        } catch (error) {
            console.error('Error adding note:', error.message);
            alert(`Failed to add note: ${error.message}`);
        } finally {
            setIsLoading(false); 
        }
    };


    return (
        <div className="min-h-full">
            
            {/* 1. Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-pink-600">Daily</span> Journal
                </h1>

                <div className="flex space-x-3">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        Back
                    </button>
                    
                    {/* View Notes Button - NOW USES ROUTER */}
                    <button 
                        // *** THIS IS THE KEY CHANGE ***
                        onClick={() => navigate('/view-all-daily-notes')} 
                        className={`flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg 
                            bg-pink-500 text-white hover:bg-pink-600` // Simplified styling
                        }
                        disabled={isLoading}
                    >
                        <ListChecks size={20} className="mr-1" />
                        View All Notes
                    </button>
                </div>
            </header>

            {/* 2. Main Content Area - Only the ADD form is needed now */}
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold text-pink-600 mb-6">
                    Create a New Entry ✍️
                </h2>

                <form onSubmit={handleAddNote}>
                    <div className="mb-4">
                        <label htmlFor="noteTitle" className="block text-gray-700 font-medium mb-2">Title</label>
                        <input
                            id="noteTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="A title for your note..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="noteContent" className="block text-gray-700 font-medium mb-2">Content</label>
                        <textarea
                            id="noteContent"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What beautiful thoughts are on your mind today?"
                            rows="6"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition resize-y"
                            required
                            disabled={isLoading}
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="noteCreator" className="block text-gray-700 font-medium mb-2">Your Name</label>
                        <input
                            id="noteCreator"
                            type="text"
                            value={madeby}
                            onChange={(e) => setMadeby(e.target.value)}
                            placeholder="Who wrote this note?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-pink-500 text-white font-bold text-lg rounded-xl hover:bg-pink-600 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:bg-pink-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding Note...' : 'Add Note to Journal'}
                    </button>
                </form>
            </div>
            
            {/* The previous {view === 'VIEW'} block is now entirely removed */}

        </div>
    );
};

export default DailyNotes;