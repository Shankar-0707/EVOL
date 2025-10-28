// src/models/DeletedMoodMuse.model.js

import mongoose from "mongoose";

// This schema mirrors the MoodMuse structure
const DeletedMoodMuseSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    mood: {
        type: String,
        required: true,
        trim: true,
    },
    promptType: {
        type: String, // 'Story' or 'Poem'
        required: true,
    },
    generatedContent: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date, // Original creation date
        required: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedMoodMuseModel = mongoose.model("DeletedMoodMuse", DeletedMoodMuseSchema);
export default DeletedMoodMuseModel;