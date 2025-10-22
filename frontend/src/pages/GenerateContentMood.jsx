// src/pages/GenerateContent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Loader2, Heart, Sparkles, BookOpen } from 'lucide-react'; 
import { motion } from 'framer-motion';

const BASE_API_URL = 'https://evol-k431.onrender.com/mood-muse'; 

const moodOptions = ['Happy', 'Thoughtful', 'Stressed', 'Romantic', 'Curious', 'Tired', 'Inspired'];

const GenerateContent = () => {
    const navigate = useNavigate();
    
    const [mood, setMood] = useState('Happy');
    const [promptType, setPromptType] = useState('Poem');
    const [isLoading, setIsLoading] = useState(false);

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { mood, promptType };
            
            const response = await axios.post(`${BASE_API_URL}/generate`, payload);
            
            alert(`AI generated a beautiful ${promptType}! Saved successfully!`);
            
            // Navigate to the view page after successful generation and save
            navigate('/mood-muse/view'); 

        } catch (err) {
            console.error("AI Generation Error:", err);
            const message = err.response?.data?.message || "Failed to generate content. Check your Gemini API key.";
            alert(`Generation Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-pink-600">Mood</span> Muse
                </h1>

                <div className="flex space-x-3">
                    {/* Back to Dashboard Button */}
                    <motion.button 
                        onClick={() => navigate('/')} 
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        Back
                    </motion.button>
                    
                    {/* View Muse Entries Button */}
                    <motion.button 
                        onClick={() => navigate('/mood-muse/view')} 
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-pink-500 text-white hover:bg-pink-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <BookOpen size={20} className="mr-1" />
                        View Muse
                    </motion.button>
                </div>
            </header>

            {/* Main Content: Input Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold text-pink-600 mb-6 flex items-center">
                    <Sparkles size={28} className="mr-3"/> 
                    Generate Content
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Mood Selector */}
                    <div>
                        <label htmlFor="mood" className="block text-gray-700 font-bold mb-2">1. Select Her Current Mood</label>
                        <select
                            id="mood"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 appearance-none bg-white text-lg"
                            disabled={isLoading}
                        >
                            {moodOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Prompt Type Selector */}
                    <div>
                        <label htmlFor="promptType" className="block text-gray-700 font-bold mb-2">2. What Should the AI Create?</label>
                        <div className="flex space-x-4">
                            <motion.button
                                type="button"
                                onClick={() => setPromptType('Poem')}
                                className={`w-1/2 py-3 rounded-xl font-bold transition duration-150 ${promptType === 'Poem' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                disabled={isLoading}
                                whileHover={{ scale: 1.05 }}
                            >
                                Write a Poem
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setPromptType('Story')}
                                className={`w-1/2 py-3 rounded-xl font-bold transition duration-150 ${promptType === 'Story' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                disabled={isLoading}
                                whileHover={{ scale: 1.05 }}
                            >
                                Write a Story
                            </motion.button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Currently selected: **{promptType}**</p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="w-full py-4 bg-purple-600 text-white font-extrabold text-xl rounded-xl hover:bg-purple-700 transition duration-200 shadow-lg disabled:bg-purple-300 flex items-center justify-center"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={24} className="animate-spin mr-3" />
                                AI is Composing...
                            </>
                        ) : (
                            <>
                                <Heart size={24} className="mr-3" />
                                Generate Content
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default GenerateContent;