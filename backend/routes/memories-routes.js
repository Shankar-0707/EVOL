import express from "express";
import { addMemory, viewMemories, deleteMemory } from "../controllers/Memories.controller.js";
const router = express.Router();


// 1. Route for adding a new memory
router.post("/add-memory", addMemory);

// 2. Route for viewing all memories
router.get("/view-memories", viewMemories);

// 3. Route for deleting a memory by ID
router.delete("/delete-memory/:id", deleteMemory);

export default router;