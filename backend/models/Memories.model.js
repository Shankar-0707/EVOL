// src/models/Memories.model.js (Using ES module syntax)

import mongoose from "mongoose";

const MemorySchema = mongoose.Schema({
    // A short, catchy title for the memory
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // The main story/description of the memory
    description: {
        type: String,
        required: true,
    },
    // The date the memory occurred
    date: {
        type: Date,
        required: true,
    },
    // The user who added the memory (Shankar or her)
    addedBy: {
        type: String, 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const MemoryModel = mongoose.model("Memories", MemorySchema);
export default MemoryModel;