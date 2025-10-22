// src/pages/AddSongs.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ChevronLeft, ListChecks, Search, Music, Disc } from 'lucide-react'; 

const BASE_API_URL = 'https://evol-server.onrender.com/our-songs'; 

const AddSongs = () => {
    const navigate = useNavigate();
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [artistTerm, setArtistTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState(null);

    // Form state (who is adding the song)
    const [addedBy, setAddedBy] = useState('Shankar'); 
    
    // --- SPOTIFY SEARCH HANDLER ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setSearchLoading(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const url = `${BASE_API_URL}/search`;
            const response = await axios.get(url, {
                params: {
                    query: searchTerm.trim(),
                    artist: artistTerm.trim(),
                }
            });

            setSearchResults(response.data.tracks);

        } catch (err) {
            console.error("Search API Error:", err);
            setSearchError("Error searching songs. Check server and Spotify API keys.");
        } finally {
            setSearchLoading(false);
        }
    };

    // --- ADD SONG TO MONGODB HANDLER ---
    const handleAddSong = async (songData) => {
        if (!addedBy.trim()) {
            alert("Please enter who is adding the song.");
            return;
        }

        try {
            const payload = {
                ...songData, // Includes spotifyId, title, artist, imageUrl
                addedBy: addedBy.trim(), 
            };
            
            await axios.post(`${BASE_API_URL}/addsong`, payload);
            
            alert(`"${songData.title}" by ${songData.artist} added successfully! 💖`);

            setSearchTerm('');
            setArtistTerm('');
            setSearchResults([]);
            setSearchError(null);
            setSearchLoading(false);
            
            // Navigate to the view page after successful addition
            navigate('/our-songs/addsong');

        } catch (err) {
            console.error("Add Song Error:", err);
            const message = err.response?.data?.message || "Failed to add song.";
            alert(`Error: ${message}`);
        }
    };

    return (
        <div className="min-h-full">
            
            {/* Header and Control Buttons */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                    <span className="text-pink-600">Add</span> Songs
                </h1>

                <div className="flex space-x-3">
                    {/* Back to Dashboard Button */}
                    <button 
                        onClick={() => navigate('/')} // Navigate back to Dashboard
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition duration-150 shadow-md"
                    >
                        <ChevronLeft size={20} className="mr-1" />
                        Back
                    </button>
                    
                    {/* View Songs Button */}
                    <button 
                        onClick={() => navigate('/our-songs/viewsongs')} 
                        className="flex items-center px-4 py-2 rounded-full font-medium transition duration-150 shadow-lg bg-pink-500 text-white hover:bg-pink-600"
                    >
                        <ListChecks size={20} className="mr-1" />
                        View All Songs
                    </button>
                </div>
            </header>

            {/* Main Content: Search and Results */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
                
                {/* Search Form */}
                <h2 className="text-3xl font-semibold text-pink-600 mb-6">Find Your Music 🎧</h2>
                <form onSubmit={handleSearch} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="songTitle" className="block text-gray-700 font-medium mb-1">Song Title</label>
                            <input
                                id="songTitle"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g., Peaches"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="artistName" className="block text-gray-700 font-medium mb-1">Artist Name (Optional)</label>
                            <input
                                id="artistName"
                                type="text"
                                value={artistTerm}
                                onChange={(e) => setArtistTerm(e.target.value)}
                                placeholder="e.g., Justin Bieber"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="addedBy" className="block text-gray-700 font-medium mb-1">Added By</label>
                            <input
                                id="addedBy"
                                type="text"
                                value={addedBy}
                                onChange={(e) => setAddedBy(e.target.value)}
                                placeholder="Shankar or Her Name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                                required
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-purple-600 text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition duration-200 shadow-md disabled:bg-purple-300 flex items-center justify-center"
                        disabled={searchLoading}
                    >
                        {searchLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin mr-2" />
                                Searching Spotify...
                            </>
                        ) : (
                            <>
                                <Search size={20} className="mr-2" />
                                Search Music
                            </>
                        )}
                    </button>
                </form>

                {/* Search Results */}
                <h3 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 border-t pt-6">Results</h3>
                
                {searchError && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{searchError}</p>}
                
                {searchResults.length === 0 && !searchLoading && !searchError && searchTerm.length > 0 && (
                    <p className="text-gray-500 p-4 border rounded-lg">No songs found. Try a different query!</p>
                )}

                <div className="space-y-4">
                    {searchResults.map((song) => (
                        <div 
                            key={song.spotifyId}
                            className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-200"
                        >
                            <img 
                                src={song.imageUrl} 
                                alt={`Album art for ${song.title}`}
                                className="w-16 h-16 rounded-lg mr-4 object-cover"
                            />
                            <div className="flex-grow">
                                <p className="text-lg font-bold text-gray-800 flex items-center"><Music size={16} className="mr-1 text-pink-500"/> {song.title}</p>
                                <p className="text-sm text-gray-600 flex items-center"><Disc size={16} className="mr-1 text-purple-500"/> {song.artist}</p>
                            </div>
                            
                            <button
                                onClick={() => handleAddSong(song)}
                                className="px-4 py-2 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition duration-150 shadow-md ml-4"
                                disabled={searchLoading}
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default AddSongs;