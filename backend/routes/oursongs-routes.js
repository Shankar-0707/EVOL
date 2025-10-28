import express from "express";
import { searchSpotify, addSong,viewSongs, deleteSong, viewDeletedSongs, permanentlyDeleteSong } from "../controllers/OurSongs.controller.js";
const router = express.Router();

router.get("/search", searchSpotify);

router.post('/addsong', addSong);

router.get('/viewsongs', viewSongs);

router.delete("/delete/:id", deleteSong);

// --- NEW ARCHIVE ROUTES ---
router.get("/view-all-deleted-songs", viewDeletedSongs); 
router.delete("/permanently-delete/:id", permanentlyDeleteSong);

export default router;
