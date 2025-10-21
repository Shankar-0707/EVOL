// src/controllers/Gallery.controller.js (UPDATED for MongoDB Storage)

import GalleryModel from '../models/Gallery.model.js';

// --- UPLOAD PHOTO CONTROLLER (POST) ---
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided." });
        }
        const { caption, uploadedBy } = req.body; 

        if (!uploadedBy) {
            return res.status(400).json({ message: "Uploader's name is required." });
        }
        
        // 1. Get the file data and type from Multer's memory storage
        const imageData = req.file.buffer;
        const mimeType = req.file.mimetype;
        
        // 2. Save image data and metadata to MongoDB
        const newPhoto = await GalleryModel.create({
            caption: caption || 'A lovely moment',
            image: imageData, // <-- SAVING THE BUFFER
            contentType: mimeType, // <-- SAVING THE MIME TYPE
            uploadedBy,
        });

        res.status(201).json({ 
            message: "Image saved to MongoDB successfully! 🌟", 
            photo: { 
                // We only return the necessary metadata, not the massive image Buffer
                _id: newPhoto._id, 
                caption: newPhoto.caption 
            }
        });

    } catch (error) {
        console.error("Upload Error:", error.message);
        res.status(500).json({ message: "Error saving photo to MongoDB." });
    }
};

// --- VIEW PHOTOS CONTROLLER (GET) ---
const viewPhotos = async (req, res) => {
    try {
        // Find all photos, sort by date, and select ONLY the required fields for the frontend
        // The image Buffer will be converted to a Base64 string for the frontend to display.
        const allPhotos = await GalleryModel.find().sort({ uploadedAt: -1 }); 
        
        // Map the MongoDB documents to the required frontend format
        const photosToSend = allPhotos.map(photo => ({
            _id: photo._id,
            caption: photo.caption,
            uploadedBy: photo.uploadedBy,
            uploadedAt: photo.uploadedAt,
            // Convert the Buffer to a Base64 string for the browser to read
            imageUrl: `data:${photo.contentType};base64,${photo.image.toString('base64')}`
        }));

        res.status(200).json({ allPhotos: photosToSend });

    } catch (error) {
        console.error("View Photos Error:", error.message);
        res.status(500).json({ message: "Error fetching photos." });
    }
};

// --- DELETE PHOTO CONTROLLER (DELETE) ---
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params; // MongoDB document ID
        
        // Delete the document from MongoDB
        const deletedPhoto = await GalleryModel.findByIdAndDelete(id);

        if (!deletedPhoto) {
            return res.status(404).json({ message: "Photo not found." });
        }

        res.status(200).json({ message: "Photo successfully deleted from MongoDB." });

    } catch (error) {
        console.error("Delete Photo Error:", error.message);
        res.status(500).json({ message: "Error deleting photo." });
    }
};

export { uploadPhoto, viewPhotos, deletePhoto };