import express from "express";
import { uploadPhoto, viewPhotos, deletePhoto, viewDeletedPhotos, permanentlyDeletePhoto, restorePhoto } from "../controllers/Gallery.controller.js";
import upload from "../middlewares/multer.js";
const router = express.Router();




// 2. POST Route: For saving URL/ID after successful ImageKit upload
router.post("/upload-photo",upload.single('image'), uploadPhoto); 

// 3. GET Route: View all photos
router.get("/view-gallery", viewPhotos);

// 4. DELETE Route: Delete photo by MongoDB ID
router.delete("/delete-photo/:id", deletePhoto);

// --- NEW ARCHIVE ROUTES ---
router.get("/view-all-deleted-photos", viewDeletedPhotos); 
router.delete("/permanently-delete/:id", permanentlyDeletePhoto);

// --- NEW RESTORE ROUTE ---
router.post("/restore/:id", restorePhoto);

export default router;