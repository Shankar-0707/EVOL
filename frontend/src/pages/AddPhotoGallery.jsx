// src/pages/AddPhoto.jsx (Updated UI/Header)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, UploadCloud, Loader2, ListChecks } from 'lucide-react'; 
import { motion } from 'framer-motion'; // Import Framer Motion

const BASE_API_URL = 'http://localhost:5000/our-gallery'; 

const AddPhoto = () => {
    const navigate = useNavigate();
    
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploadedBy, setUploadedBy] = useState('Shankar'); 
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(null);
        }
    };

    // --- SUBMIT HANDLER (Remains the same as previous) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !uploadedBy.trim()) {
            alert("Please select an image and enter your name.");
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append('image', file); 
        formData.append('caption', caption.trim());
        formData.append('uploadedBy', uploadedBy.trim());

        try {
            await axios.post(`${BASE_API_URL}/upload-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert(`Photo uploaded and saved to MongoDB successfully! 📸`);
            
            setFile(null); setCaption(''); setPreviewUrl(null);
            
            navigate('/our-gallery/upload-photo'); 

        } catch (err) {
            console.error("Upload Error:", err);
            const message = err.response?.data?.message || "Failed to upload photo.";
            alert(`Upload Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-teal-600">Add</span> Photo
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
                    
                    {/* View Gallery Button */}
                    <motion.button 
                        onClick={() => navigate('/our-gallery/view-gallery')} 
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-teal-500 text-white hover:bg-teal-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <ListChecks size={20} className="mr-1" />
                        View Gallery
                    </motion.button>
                </div>
            </header>

            {/* Main Content: Upload Form (Remains the same) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-teal-400 p-6 rounded-xl hover:bg-teal-50 transition duration-200 cursor-pointer">
                        <label className="flex flex-col items-center justify-center text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                required={!file}
                            />
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Image Preview" className="w-48 h-48 object-cover rounded-lg mb-4 shadow-lg"/>
                                    <p className="text-teal-700 font-semibold">Image Selected. Click to change.</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={48} className="text-teal-500 mb-3" />
                                    <p className="text-lg text-teal-700 font-semibold">Click here to upload a photo</p>
                                    <p className="text-sm text-gray-500">(Max 5MB, JPEG/PNG)</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Caption */}
                    <div>
                        <label htmlFor="caption" className="block text-gray-700 font-bold mb-2">Caption (Optional)</label>
                        <input
                            id="caption"
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="What's this memory called?"
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Uploaded By */}
                    <div>
                        <label htmlFor="uploadedBy" className="block text-gray-700 font-bold mb-2">Uploaded By</label>
                        <input
                            id="uploadedBy"
                            type="text"
                            value={uploadedBy}
                            onChange={(e) => setUploadedBy(e.target.value)}
                            placeholder="Shankar or Her Name"
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-pink-500 text-white font-extrabold text-xl rounded-xl hover:bg-pink-600 transition duration-200 shadow-lg disabled:bg-pink-300 flex items-center justify-center"
                        disabled={isLoading || !file}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={24} className="animate-spin mr-3" />
                                Uploading & Saving...
                            </>
                        ) : (
                            'Upload Photo'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPhoto;