// src/controllers/Memories.controller.js

import MemoryModel from '../models/Memories.model.js'; 
import DeletedMemoryModel from '../models/DeletedMemory.model.js';

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

const deleteMemory = async (req, res) => { 
    try {
        const id = req.params.id; // Original MongoDB ID
        
        const memoryToArchive = await MemoryModel.findById(id);

        if (!memoryToArchive) {
            return res.status(404).json({ message: "Memory not found for deletion." });
        }
        
        // 2. Soft Delete: Create archive entry
        await DeletedMemoryModel.create({
            originalId: memoryToArchive._id,
            title: memoryToArchive.title,
            description: memoryToArchive.description,
            date: memoryToArchive.date,
            addedBy: memoryToArchive.addedBy,
            createdAt: memoryToArchive.createdAt, // Preserve original date
        });

        // 3. Hard Delete from active model
        await MemoryModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Memory successfully moved to archive." });

    } catch (error) {
        console.error("Soft Delete Memory Error:", error.message);
        res.status(500).json({ message: "Server error during memory soft deletion." });
    }
};

// --- 2. VIEW DELETED MEMORIES CONTROLLER (GET) ---
const viewDeletedMemories = async (req, res) => {
    try {
        const deletedMemories = await DeletedMemoryModel.find().sort({ deletedAt: -1 }); 
        res.status(200).json({ deletedMemories });
    } catch (error) {
        res.status(500).json({ message: "Error fetching deleted memories." });
    }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeleteMemory = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedMemoryModel
        
        const permanentlyDeleted = await DeletedMemoryModel.findByIdAndDelete(id);

        if (!permanentlyDeleted) {
            return res.status(404).json({ message: "Deleted memory entry not found in trash." });
        }

        res.status(200).json({ message: "Memory permanently deleted from trash." });

    } catch (error) {
        console.error("Permanent Delete Memory Error:", error.message);
        res.status(500).json({ message: "Server error during permanent deletion." });
    }
};


export { addMemory, viewMemories, deleteMemory, viewDeletedMemories, permanentlyDeleteMemory };