// src/pages/GenerateQuiz.jsx (UPDATED for Interactive Workflow)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Loader2, Heart, Sparkles, BookOpen, Send } from 'lucide-react'; 
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BASE_API_URL = 'https://evol-k431.onrender.com/couple-quiz'; 

const categoryOptions = [
    'Favorite Memories', 
    'Future Plans', 
    'Daily Habits', 
    'Preferences & Hobbies', 
    'Inside Jokes',
    'Date Nights'
];

const GenerateQuiz = () => {
    const navigate = useNavigate();
    
    // Step 1: Input states
    const [category, setCategory] = useState(categoryOptions[0]);
    
    // Step 2: Question/Answer storage states
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState('');
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    // --- HANDLER 1: AI GENERATION ---
    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setCurrentQuestion(null); // Clear previous question

        try {
            const payload = { category };
            
            // 1. Call backend to get ONLY the question text
            const response = await axios.post(`${BASE_API_URL}/generate`, payload);
            
            // 2. Store the question, moving the user to the answer input stage
            setCurrentQuestion(response.data.question);
            setCorrectAnswer(''); // Ensure answer is cleared

        } catch (err) {
            console.error("AI Generation Error:", err);
            const message = err.response?.data?.message || "Failed to generate question.";
            toast.error(`Generation Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // --- HANDLER 2: SAVE QUESTION AND ANSWER ---
    const handleSave = async (e) => {
        e.preventDefault();
        if (!correctAnswer.trim()) {
            alert("Please provide the correct answer before saving.");
            return;
        }
        setIsSaving(true);

        try {
            const payload = {
                question: currentQuestion,
                correctAnswer: correctAnswer.trim(),
                category: category,
            };
            
            // 1. Call backend to save the full entry
            await axios.post(`${BASE_API_URL}/save-answer`, payload);
            
            alert(`Question & Answer saved! Ready for the next one!`);
            
            // 2. Reset the flow for the next question
            setCurrentQuestion(null);
            setCorrectAnswer('');
            
            // Optional: navigate('/view-quiz'); if you want to see the list immediately

        } catch (err) {
            console.error("Save Error:", err);
            const message = err.response?.data?.message || "Failed to save question/answer.";
            alert(`Saving Failed: ${message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const renderContent = () => {
        if (currentQuestion) {
            // --- VIEW 2: ANSWER INPUT ---
            return (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-semibold text-pink-600 mb-4 flex items-center">
                        <Sparkles size={28} className="mr-3"/> 
                        Question Generated!
                    </h2>
                    <div className="mb-6 p-4 border-l-4 border-purple-400 bg-purple-50">
                        <p className="text-sm font-bold text-gray-700 mb-1">Category: {category}</p>
                        <p className="text-xl font-extrabold text-gray-900 leading-relaxed">{currentQuestion}</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label htmlFor="answer" className="block text-gray-700 font-bold mb-2">
                                What is the correct answer?
                            </label>
                            <input
                                id="answer"
                                type="text"
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                placeholder="Enter the definitive answer here..."
                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400"
                                required
                                disabled={isSaving}
                            />
                            <p className="text-xs text-gray-500 mt-1">This answer will be stored as correct for the quiz.</p>
                        </div>
                        
                        <motion.button
                            type="submit"
                            className="w-full py-4 bg-green-600 text-white font-extrabold text-xl rounded-xl hover:bg-green-700 transition duration-200 shadow-lg disabled:bg-green-300 flex items-center justify-center"
                            disabled={isSaving || !currentQuestion}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={24} className="animate-spin mr-3" />
                                    Saving Q & A...
                                </>
                            ) : (
                                <>
                                    <Send size={24} className="mr-3" />
                                    Save & Generate Next Question
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            );
        }

        // --- VIEW 1: CATEGORY SELECTION & GENERATE BUTTON ---
        return (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <h2 className="text-3xl font-semibold text-pink-600 mb-6 flex items-center">
                    <Sparkles size={28} className="mr-3"/> 
                    Start New Question
                </h2>
                <form onSubmit={handleGenerate} className="space-y-6">
                    
                    <div>
                        <label htmlFor="category" className="block text-gray-700 font-bold mb-2">Choose the Question Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 appearance-none bg-white text-lg"
                            disabled={isLoading}
                        >
                            {categoryOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">The AI will generate a personalized question based on this topic.</p>
                    </div>

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
                                Generating Question...
                            </>
                        ) : (
                            <>
                                <Heart size={24} className="mr-3" />
                                Generate Question
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-purple-600">Couple</span> Quiz
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
                    
                    {/* View Quiz Entries Button */}
                    <motion.button 
                        onClick={() => navigate('/couple-quiz/view')} 
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-pink-500 text-white hover:bg-pink-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading || isSaving}
                    >
                        <BookOpen size={20} className="mr-1" />
                        View Quiz
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            {renderContent()}
            
        </div>
    );
};

export default GenerateQuiz;