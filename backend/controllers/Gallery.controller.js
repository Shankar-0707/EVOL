// src/controllers/Gallery.controller.js (UPDATED for MongoDB Storage)

import GalleryModel from '../models/Gallery.model.js';
import DeletedGalleryModel from '../models/DeletedGaller.model.js';

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

const deletePhoto = async (req, res) => { 
    try {
        const id = req.params.id; // Original MongoDB ID
        
        // 1. Find the original photo
        const photoToArchive = await GalleryModel.findById(id);

        if (!photoToArchive) {
            return res.status(404).json({ message: "Photo not found for deletion." });
        }
        
        // 2. Soft Delete: Create archive entry, transferring ALL image data (Buffer)
        await DeletedGalleryModel.create({
            originalId: photoToArchive._id,
            caption: photoToArchive.caption,
            image: photoToArchive.image, 
            contentType: photoToArchive.contentType,
            uploadedBy: photoToArchive.uploadedBy,
            uploadedAt: photoToArchive.uploadedAt,
        });

        // 3. Hard Delete from active model
        await GalleryModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Photo successfully moved to trash." });

    } catch (error) {
        console.error("Soft Delete Error:", error.message);
        res.status(500).json({ message: "Server error during photo soft deletion." });
    }
};

// --- 2. VIEW DELETED PHOTOS CONTROLLER (GET) ---
const viewDeletedPhotos = async (req, res) => {
    try {
        const deletedPhotos = await DeletedGalleryModel.find().sort({ deletedAt: -1 }); 
        
        // Convert the Buffer to Base64 URL for the frontend
        const photosToSend = deletedPhotos.map(photo => ({
            _id: photo._id,
            caption: photo.caption,
            uploadedBy: photo.uploadedBy,
            uploadedAt: photo.uploadedAt,
            deletedAt: photo.deletedAt,
            // Convert Buffer to Base64 string for display
            imageUrl: `data:${photo.contentType};base64,${photo.image.toString('base64')}`
        }));

        res.status(200).json({ deletedPhotos: photosToSend });
    } catch (error) {
        console.error("View Deleted Photos Error:", error.message);
        res.status(500).json({ message: "Error fetching deleted photos." });
    }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeletePhoto = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedGalleryModel
        
        const permanentlyDeleted = await DeletedGalleryModel.findByIdAndDelete(id);

        if (!permanentlyDeleted) {
            return res.status(404).json({ message: "Deleted photo entry not found in trash." });
        }

        res.status(200).json({ message: "Photo permanently deleted from trash." });

    } catch (error) {
        console.error("Permanent Delete Error:", error.message);
        res.status(500).json({ message: "Server error during permanent deletion." });
    }
};

export { uploadPhoto, viewPhotos, deletePhoto, viewDeletedPhotos, permanentlyDeletePhoto };