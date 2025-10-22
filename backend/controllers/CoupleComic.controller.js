// src/controllers/CoupleComic.controller.js

import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
dotenv.config(); 
import CoupleComicModel from '../models/CoupleComic.model.js';

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
        
        const deletedComic = await CoupleComicModel.findByIdAndDelete(id);

        if (!deletedComic) {
            return res.status(404).json({ message: "Comic not found." });
        }

        res.status(200).json({ message: "Comic successfully deleted." });

    } catch (error) {
        console.error("Delete Comic Error:", error.message);
        res.status(500).json({ message: "Server error during comic deletion." });
    }
};


export { generateComic, viewComics, deleteComic };