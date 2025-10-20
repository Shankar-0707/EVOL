// src/controllers/Memories.controller.js

import MemoryModel from '../models/Memories.model.js'; 

// --- ADD MEMORY CONTROLLER (POST) ---
const addMemory = async (req, res) => {
    try {
        const { title, description, date, addedBy } = req.body; 

        if (!title || !description || !date || !addedBy) {
            return res.status(400).json({ message: "Missing required fields for the memory." });
        }

        const newMemory = await MemoryModel.create({
            title,
            description,
            date: new Date(date), // Ensure date is stored as a Date object
            addedBy,
        });

        res.status(201).json({ 
            message: "Memory added successfully! 💖", 
            memory: newMemory 
        });

    } catch (error) {
        console.error("MongoDB Save Error:", error.message);
        res.status(500).json({ message: "Error saving memory to database." });
    }
};

// --- VIEW ALL MEMORIES CONTROLLER (GET) ---
const viewMemories = async (req, res) => {
    try {
        // Fetch all memories, sorted by date (most recent first)
        const allMemories = await MemoryModel.find().sort({ date: -1 }); 
        res.status(200).json({ allMemories });
    } catch (error) {
        console.error("View Memories Error:", error.message);
        res.status(500).json({ message: "Error fetching all memories." });
    }
};

// --- DELETE MEMORY CONTROLLER (DELETE) ---
const deleteMemory = async (req, res) => {
    try {
        const { id } = req.params; // Get the MongoDB document ID
        
        const deletedMemory = await MemoryModel.findByIdAndDelete(id);

        if (!deletedMemory) {
            return res.status(404).json({ message: "Memory not found." });
        }

        res.status(200).json({
            message: "Memory successfully deleted.",
            deletedMemory: deletedMemory
        });

    } catch (error) {
        console.error("Delete Memory Error:", error.message);
        res.status(500).json({ message: "Server error during memory deletion." });
    }
};


export { addMemory, viewMemories, deleteMemory };