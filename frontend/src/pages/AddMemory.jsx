// src/pages/AddMemory.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, HeartHandshake, BookMarked } from 'lucide-react'; 

const BASE_API_URL = 'http://localhost:5000/our-memories'; 

const AddMemory = () => {
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [addedBy, setAddedBy] = useState('Shankar'); 
    const [isLoading, setIsLoading] = useState(false);

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                date,
                addedBy: addedBy.trim(), 
            };
            
            await axios.post(`${BASE_API_URL}/add-memory`, payload);
            
            alert(`Memory "${title}" saved successfully!`);
            
            // Clear form and navigate
            setTitle('');
            setDescription('');
            setDate('');
            
            // Navigate to the view page after successful addition
            navigate('/our-memories.add-memory'); 

        } catch (err) {
            console.error("Add Memory Error:", err);
            const message = err.response?.data?.message || "Failed to save memory.";
            alert(`Error: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-purple-600">Add</span> a Memory
                </h1>

                <div className="flex space-x-3">
                    {/* Back to Dashboard Button */}
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        Back
                    </button>
                    
                    {/* View Memories Button */}
                    <button 
                        onClick={() => navigate('/our-memories/view-memories')} 
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-purple-500 text-white hover:bg-purple-600"
                    >
                        <BookMarked size={20} className="mr-1" />
                        View Memories
                    </button>
                </div>
            </header>

            {/* Main Content: Input Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Memory Title / Occasion</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., First trip to the mountains"
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className="block text-gray-700 font-bold mb-2 flex items-center"><Calendar size={18} className="mr-2 text-pink-500"/> Date</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                required
                            />
                        </div>
                        
                        {/* Added By */}
                        <div>
                            <label htmlFor="addedBy" className="block text-gray-700 font-bold mb-2 flex items-center"><HeartHandshake size={18} className="mr-2 text-pink-500"/> Added By</label>
                            <input
                                id="addedBy"
                                type="text"
                                value={addedBy}
                                onChange={(e) => setAddedBy(e.target.value)}
                                placeholder="Shankar or Her Name"
                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Detailed Memory</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="6"
                            placeholder="Write down everything you remember about this special day..."
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-pink-500 text-white font-extrabold text-xl rounded-xl hover:bg-pink-600 transition duration-200 shadow-lg disabled:bg-pink-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving Memory...' : 'Save This Memory Forever'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMemory;