// src/models/DeletedGallery.model.js

import mongoose from "mongoose";

// This schema mirrors the Gallery structure
const DeletedGallerySchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    caption: {
        type: String,
        trim: true,
        default: 'A beautiful moment',
    },
    image: {
        type: Buffer, // Stores the actual image file data
        required: true,
    },
    contentType: {
        type: String, // Stores the MIME type (e.g., 'image/jpeg')
        required: true,
    },
    uploadedBy: {
        type: String, 
        required: true,
    },
    uploadedAt: { // Original upload date
        type: Date,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedGalleryModel = mongoose.model("DeletedGallery", DeletedGallerySchema);
export default DeletedGalleryModel;