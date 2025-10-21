// src/models/Gallery.model.js (Using ES module syntax)

import mongoose from "mongoose";

const GallerySchema = mongoose.Schema({
    // A short title for the photo
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
    // Who uploaded the image
    uploadedBy: {
        type: String, 
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    }
});

const GalleryModel = mongoose.model("Gallery", GallerySchema);
export default GalleryModel;