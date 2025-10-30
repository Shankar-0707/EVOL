// src/controllers/CoupleComic.controller.js

import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
dotenv.config(); 
import CoupleComicModel from '../models/CoupleComic.model.js';
import DeletedComicModel from '../models/DeletedComic.model.js';

// Initialize the Gemini AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash'; 

// --- GENERATE COMIC CONTROLLER (POST) ---
const generateComic = async (req, res) => {
    try {
        const { theme } = req.body; 

        if (!theme) {
            return res.status(400).json({ message: "A theme or key moment is required." });
        }

        // 1. Construct the detailed prompt for the AI
        const systemInstruction = `You are a creative writer specializing in generating sweet, short, four-panel comic strips about a loving couple. The comic MUST revolve around the provided theme/key moment and be highly romantic and cute. Your output MUST be a single JSON object.`;
        
        const userPrompt = `Generate a short comic based on the theme/key moment: "${theme}". The output JSON MUST contain two keys: 1) "comicTitle" (a short, catchy title) and 2) "panels" (an array of 4 objects). Each object in the "panels" array MUST have three keys: "panelNumber" (1-4), "setting" (a brief description of the scene), and "dialogue" (the spoken text/narration). DO NOT include any text outside the JSON object.`;

        // 2. Call the Gemini API
        const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                responseMimeType: "application/json", 
            },
        });
        
        // 3. Parse and Validate the JSON response
        const jsonText = response.text.trim();
        const comicData = JSON.parse(jsonText);
        
        if (!comicData.comicTitle || !Array.isArray(comicData.panels) || comicData.panels.length === 0) {
            return res.status(500).json({ message: "AI failed to generate comic in required JSON format." });
        }
        
        // 4. Save the result to MongoDB
        const newComic = await CoupleComicModel.create({
            theme,
            comicTitle: comicData.comicTitle,
            panels: comicData.panels,
        });

        res.status(201).json({ 
            message: "Comic generated and saved!", 
            comic: newComic 
        });

    } catch (error) {
        console.error("AI Generation or MongoDB Error:", error.message);
        res.status(500).json({ message: "Server error during comic generation. Check Gemini API key and JSON parsing." });
    }
};

// --- VIEW ALL COMICS CONTROLLER (GET) ---
const viewComics = async (req, res) => {
    try {
        const allComics = await CoupleComicModel.find().sort({ createdAt: -1 }); 
        res.status(200).json({ allComics });
    } catch (error) {
        console.error("View Comics Error:", error.message);
        res.status(500).json({ message: "Error fetching all comics." });
    }
};

// --- DELETE COMIC CONTROLLER (DELETE) ---
const deleteComic = async (req, res) => {
    try {
        const { id } = req.params; 

        const comicToArchive = await CoupleComicModel.findById(id);

        if (!comicToArchive) {
            return res.status(404).json({ message: "Comic not found for deletion." });
        }

        await DeletedComicModel.create({
            originalId: comicToArchive._id,
            theme: comicToArchive.theme,
            comicTitle: comicToArchive.comicTitle,
            panels: comicToArchive.panels,
            // deletedAt defaults to Date.now()
        });

        // 3. Permanently delete the comic from the active model
        await CoupleComicModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Comic successfully moved to trash." });
        
        // const deletedComic = await CoupleComicModel.findByIdAndDelete(id);

        // if (!deletedComic) {
        //     return res.status(404).json({ message: "Comic not found." });
        // }

        // res.status(200).json({ message: "Comic successfully deleted." });

    } catch (error) {
        console.error("Soft Delete Error:", error.message);
        res.status(500).json({ message: "Server error during comic deletion (soft)." });
    }
};



// --- 2. VIEW DELETED COMICS CONTROLLER (GET) ---
const viewDeletedComics = async (req, res) => {
    try {
        // Fetch all deleted comics, sorted by deletion time
        const deletedComics = await DeletedComicModel.find().sort({ deletedAt: -1 }); 
        res.status(200).json({ deletedComics });
    } catch (error) {
        console.error("View Deleted Comics Error:", error.message);
        res.status(500).json({ message: "Error fetching deleted comics." });
    }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeleteComic = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedComicModel
        
        const permanentlyDeleted = await DeletedComicModel.findByIdAndDelete(id);

        if (!permanentlyDeleted) {
            return res.status(404).json({ message: "Deleted comic entry not found in trash." });
        }

        res.status(200).json({ message: "Comic permanently deleted from trash." });

    } catch (error) {
        console.error("Permanent Delete Error:", error.message);
        res.status(500).json({ message: "Server error during permanent deletion." });
    }
};


// --- NEW CONTROLLER: RESTORE COMIC (POST) ---
const restoreComic = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedComicModel
        
        // 1. Find the deleted comic entry
        const deletedComicEntry = await DeletedComicModel.findById(id);

        if (!deletedComicEntry) {
            return res.status(404).json({ message: "Comic not found in archive." });
        }
        
        // 2. Create the restored comic in the active collection, using original data
        await CoupleComicModel.create({
            theme: deletedComicEntry.theme,
            comicTitle: deletedComicEntry.comicTitle,
            panels: deletedComicEntry.panels,
            createdAt: deletedComicEntry.createdAt, // Preserve original creation date
        });

        // 3. Permanently delete the entry from the archive model
        await DeletedComicModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Comic restored to active list!" });

    } catch (error) {
        console.error("Restore Comic Error:", error.message);
        res.status(500).json({ message: "Server error during comic restoration." });
    }
};


export { generateComic, viewComics, deleteComic, viewDeletedComics, permanentlyDeleteComic, restoreComic };