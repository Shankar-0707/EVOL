// src/controllers/OurSongs.controller.js (Final Code)
import dotenv from "dotenv";
dotenv.config();
import axios from 'axios';
// Assuming you have 'dotenv' set up in your server.js for process.env
// If not, you may need: import 'dotenv/config'; 
import SongModel from '../models/OurSongs.model.js'; 
import DeletedSongModel from "../models/DeletedSong.model.js";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// --- Helper function to get Spotify Access Token ---
// This is the CRITICAL step that uses your Client ID and Secret
const getAccessToken = async () => {
    const authString = Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Spotify Token Error:", error.message);
        throw new Error("Failed to authenticate with Spotify. Check your Client ID/Secret.");
    }
};

// --- SEARCH CONTROLLER ---
const searchSpotify = async (req, res) => {
    try {
        const { query, artist } = req.query; 
        
        if (!query) {
            return res.status(400).json({ message: "Search query is required." });
        }
        
        let searchQ = `track:${query}`;
        if (artist) {
            searchQ += ` artist:${artist}`;
        }
        
        const accessToken = await getAccessToken();
        
        const spotifyResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: {
                q: searchQ,
                type: 'track',
                limit: 10 
            }
        });

        // Map Spotify tracks to a cleaner format for the frontend
        const tracks = spotifyResponse.data.tracks.items.map(item => ({
            spotifyId: item.id,
            title: item.name,
            artist: item.artists.map(a => a.name).join(', '),
            // Use the largest available image for the album art
            imageUrl: item.album.images.length > 0 ? item.album.images[0].url : 'placeholder_url',
        }));

        res.status(200).json({ tracks });

    } catch (error) {
        console.error("Spotify Search Error:", error.message);
        res.status(500).json({ message: "Error searching Spotify. Ensure API keys are correct." });
    }
};

// --- ADD SONG CONTROLLER (Saves to MongoDB) ---
const addSong = async (req, res) => {
    try {
        const { spotifyId, title, artist, imageUrl, addedBy } = req.body; 

        if (!spotifyId || !title || !artist || !imageUrl || !addedBy) {
            return res.status(400).json({ message: "Missing required song details." });
        }

        const existingSong = await SongModel.findOne({ spotifyId });
        if (existingSong) {
            return res.status(409).json({ message: "This song is already in your shared collection!" });
        }

        const newSong = await SongModel.create({
            spotifyId,
            title,
            artist,
            imageUrl,
            addedBy,
        });

        res.status(201).json({ 
            message: "Song added successfully!", 
            song: newSong 
        });

    } catch (error) {
        console.error("MongoDB Save Error:", error.message);
        res.status(500).json({ message: "Error saving song to database." });
    }
};

// --- VIEW SONGS CONTROLLER (Placeholder) ---
const viewSongs = async (req, res) => {
    try {
        const allSongs = await SongModel.find().sort({ addedAt: -1 });
        res.status(200).json({ allSongs });
    } catch (error) {
        console.error("View Songs Error:", error.message);
        res.status(500).json({ message: "Error fetching all songs." });
    }
};

// --- 1. SOFT DELETE SONG CONTROLLER (Archives the song) ---
const deleteSong = async (req, res) => { 
    try {
        const { id } = req.params; // Original MongoDB ID
        
        const songToArchive = await SongModel.findById(id);

        if (!songToArchive) {
            return res.status(404).json({ message: "Song not found for deletion." });
        }
        
        // 2. Soft Delete: Create archive entry
        await DeletedSongModel.create({
            originalId: songToArchive._id,
            title: songToArchive.title,
            artist: songToArchive.artist,
            spotifyId: songToArchive.spotifyId,
            imageUrl: songToArchive.imageUrl,
            addedBy: songToArchive.addedBy,
            addedAt: songToArchive.addedAt, // Preserve original date
        });

        // 3. Hard Delete from active model
        await SongModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Song successfully moved to archive." });

    } catch (error) {
        console.error("Soft Delete Song Error:", error.message);
        res.status(500).json({ message: "Server error during song soft deletion." });
    }
};

// --- 2. VIEW DELETED SONGS CONTROLLER (GET) ---
const viewDeletedSongs = async (req, res) => {
    try {
        const deletedSongs = await DeletedSongModel.find().sort({ deletedAt: -1 }); 
        res.status(200).json({ deletedSongs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching deleted songs." });
    }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeleteSong = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedSongModel
        
        const permanentlyDeleted = await DeletedSongModel.findByIdAndDelete(id);

        if (!permanentlyDeleted) {
            return res.status(404).json({ message: "Deleted song entry not found in trash." });
        }

        res.status(200).json({ message: "Song permanently deleted from trash." });

    } catch (error) {
        console.error("Permanent Delete Song Error:", error.message);
        res.status(500).json({ message: "Server error during permanent deletion." });
    }
};

export { searchSpotify, addSong, viewSongs, deleteSong, viewDeletedSongs, permanentlyDeleteSong };