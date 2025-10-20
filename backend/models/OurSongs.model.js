// src/models/OurSongs.model.js (Using ES module syntax)

import mongoose from "mongoose";

const SongSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    spotifyId: {
        type: String,
        required: true,
        unique: true, // Prevents adding the same song twice
    },
    imageUrl: {
        type: String, // URL to the album art
        required: true,
    },
    addedBy: {
        type: String, // The user who added the song (Shankar or her)
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    }
});

const SongModel = mongoose.model("Songs", SongSchema);
export default SongModel;