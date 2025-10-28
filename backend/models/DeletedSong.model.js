// src/models/DeletedSong.model.js

import mongoose from "mongoose";

// This schema mirrors the Song structure
const DeletedSongSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
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
    },
    imageUrl: {
        type: String,
        required: true,
    },
    addedBy: {
        type: String, 
        required: true,
    },
    addedAt: { // Original added date
        type: Date,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedSongModel = mongoose.model("DeletedSong", DeletedSongSchema);
export default DeletedSongModel;