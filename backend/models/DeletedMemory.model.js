// src/models/DeletedMemory.model.js

import mongoose from "mongoose";

// This schema mirrors the Memory structure
const DeletedMemorySchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: { // Original memory date
        type: Date,
        required: true,
    },
    addedBy: {
        type: String, 
        required: true,
    },
    createdAt: { // Original creation date
        type: Date,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedMemoryModel = mongoose.model("DeletedMemory", DeletedMemorySchema);
export default DeletedMemoryModel;