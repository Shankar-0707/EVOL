// src/controllers/MoodMuse.controller.js

import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv"
dotenv.config(); // Load environment variables
import MoodMuseModel from '../models/MoodMuse.model.js';

// Initialize the Gemini AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash'; // Fast model for text generation

// --- GENERATE CONTENT CONTROLLER (POST) ---
const generateContent = async (req, res) => {
    try {
        const { mood, promptType } = req.body; 

        if (!mood || !promptType) {
            return res.status(400).json({ message: "Mood and Prompt Type are required." });
        }

        // 1. Construct the detailed prompt for the AI
        const systemInstruction = "You are a warm, romantic, and encouraging storyteller/poet writing for a deeply loved partner. Your content should be sweet, personalized, and comforting, reflecting the mood provided. Use modern, engaging language.";
        
        const userPrompt = `Write a short, beautiful, and romantic ${promptType} (about 5-7 lines/sentences long) for my girlfriend. The content should revolve around the theme of our relationship, love, and comfort, and match her current mood, which is: **${mood}**. Title the piece at the beginning.`;

        // 2. Call the Gemini API
        const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8, // Higher temperature for more creative output
            },
        });
        
        const generatedContent = response.text.trim();

        if (!generatedContent) {
            return res.status(500).json({ message: "AI failed to generate content. Try again." });
        }
        
        // 3. Save the result to MongoDB
        const newEntry = await MoodMuseModel.create({
            mood,
            promptType,
            generatedContent,
        });

        res.status(201).json({ 
            message: "Content generated and saved successfully! 💖", 
            entry: newEntry 
        });

    } catch (error) {
        console.error("AI Generation or MongoDB Error:", error.message);
        res.status(500).json({ message: "Server error during content generation. Check Gemini API key." });
    }
};

// --- VIEW ALL ENTRIES CONTROLLER (GET) ---
const viewEntries = async (req, res) => {
    try {
        // Fetch all entries, sorted by creation date (most recent first)
        const allEntries = await MoodMuseModel.find().sort({ createdAt: -1 }); 
        res.status(200).json({ allEntries });
    } catch (error) {
        console.error("View Entries Error:", error.message);
        res.status(500).json({ message: "Error fetching all mood muse entries." });
    }
};

// --- DELETE ENTRY CONTROLLER (DELETE) ---
const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const deletedEntry = await MoodMuseModel.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Entry not found." });
        }

        res.status(200).json({ message: "Entry successfully deleted." });

    } catch (error) {
        console.error("Delete Entry Error:", error.message);
        res.status(500).json({ message: "Server error during entry deletion." });
    }
};


export { generateContent, viewEntries, deleteEntry };