import express from "express";
import { generateComic, viewComics, deleteComic, viewDeletedComics, permanentlyDeleteComic } from "../controllers/CoupleComic.controller.js";
const router = express.Router();

// 1. POST Route for generating and saving the comic
router.post("/generate", generateComic);

// 2. GET Route for viewing all comics
router.get("/view", viewComics);

// 3. DELETE Route for deleting a comic by ID
router.delete("/delete/:id", deleteComic);

// GET route for viewing all deleted comics
router.get("/view-all-deleted-comics", viewDeletedComics);

// DELETE route for permanent deletion (using the DeletedComicModel ID)
router.delete("/permanently-delete/:id", permanentlyDeleteComic);

export default router;