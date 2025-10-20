import express from "express";
import { searchSpotify, addSong,viewSongs, deleteSong } from "../controllers/OurSongs.controller.js";
const router = express.Router();

router.get("/search", searchSpotify);

router.post('/addsong', addSong);

router.get('/viewsongs', viewSongs);

router.delete("/delete/:id", deleteSong);

export default router;
