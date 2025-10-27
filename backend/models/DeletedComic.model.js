// src/models/DeletedComic.model.js

import mongoose from "mongoose";

// This schema mirrors the CoupleComicSchema but adds a deletion timestamp
const DeletedComicSchema = mongoose.Schema({
    // Store the original MongoDB ID for reference/restoration (optional but good practice)
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    theme: {
        type: String,
        required: true,
    },
    comicTitle: {
        type: String,
        required: true,
    },
    panels: [
        {
            panelNumber: { type: Number, required: true },
            setting: { type: String, required: true },
            dialogue: { type: String, required: true },
        }
    ],
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedComicModel = mongoose.model("DeletedComic", DeletedComicSchema);
export default DeletedComicModel;