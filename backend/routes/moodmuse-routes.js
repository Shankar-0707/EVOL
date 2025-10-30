import express from "express";
import { generateContent, viewEntries, deleteEntry, viewDeletedEntries, permanentlyDeleteEntry, restoreEntry } from "../controllers/MoodMuse.controller.js";
const router = express.Router();

// 1. POST Route for generating and saving content
router.post("/generate", generateContent);

// 2. GET Route for viewing all entries
router.get("/view", viewEntries);

// 3. DELETE Route for deleting an entry by ID
router.delete("/delete/:id", deleteEntry);

router.get("/view-all-deleted-entries", viewDeletedEntries); 
router.delete("/permanently-delete/:id", permanentlyDeleteEntry);

// --- NEW RESTORE ROUTE ---
router.post("/restore/:id", restoreEntry);

export default router;