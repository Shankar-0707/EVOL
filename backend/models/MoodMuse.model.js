// src/models/MoodMuse.model.js (Using ES module syntax)

import mongoose from "mongoose";

const MoodMuseSchema = mongoose.Schema({
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
    // The date the entry was created
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const MoodMuseModel = mongoose.model("MoodMuse", MoodMuseSchema);
export default MoodMuseModel;