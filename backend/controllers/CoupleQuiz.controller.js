// src/controllers/CoupleQuiz.controller.js

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
import CoupleQuizModel from "../models/CoupleQuiz.model.js";
import DeletedQuizModel from "../models/DeletedQuiz.model.js";

// Initialize the Gemini AI Client (Ensure GEMINI_API_KEY is in your .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = "gemini-2.5-flash";

// --- GENERATE QUESTION CONTROLLER (POST) ---
const generateQuestion = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Quiz category is required." });
    }

    // 1. Construct the detailed prompt for the AI
    const systemInstruction =
      "You are an expert quiz master generating highly personalized, sweet, and fun questions for a couple's quiz. The question must be about one partner's preferences, memories, or habits, and the response must be formatted strictly as a single JSON object.";

    const userPrompt = `Generate one simple, cute quiz question about one partner and the correct answer, based on the category: **${category}**. The question should be easy to answer for the other partner. The output MUST be a JSON object with two keys: "question" (string) and "correctAnswer" (string). DO NOT include any other text or formatting outside the JSON block.`;

    // 2. Call the Gemini API
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        // Crucial: Use JSON output
        responseMimeType: "application/json",
      },
    });

    const temp = response.text.trim();
    const questionText = JSON.parse(temp);

    if (!questionText) {
      return res
        .status(500)
        .json({ message: "AI failed to generate question text." });
    }

    // 3. Return the question text to the frontend immediately
    res.status(200).json({
      message: "Question generated!",
      question: questionText.question,
    });
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    res.status(500).json({
      message: "Server error during question generation. Check Gemini API key.",
    });
  }
};

const saveAnsweredQuestion = async (req, res) => {
  try {
    console.log("Incoming save request:", req.body);
    const { question, correctAnswer, category } = req.body;

    if (!question || !correctAnswer || !category) {
      return res
        .status(400)
        .json({ message: "Missing question, answer, or category for saving." });
    }

    // 1. Save the full entry to MongoDB
    const newQuestion = await CoupleQuizModel.create({
      question,
      correctAnswer,
      category,
    });

    res.status(201).json({
      message: "Question and Answer saved successfully!",
      question: newQuestion,
    });
  } catch (error) {
    console.error("MongoDB Save Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while saving the answered question." });
  }
};

// --- VIEW ALL QUESTIONS CONTROLLER (GET) ---
const viewQuestions = async (req, res) => {
  try {
    const allQuestions = await CoupleQuizModel.find().sort({ createdAt: -1 });
    res.status(200).json({ allQuestions });
  } catch (error) {
    console.error("View Questions Error:", error.message);
    res.status(500).json({ message: "Error fetching all quiz questions." });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the original quiz
    const quizToArchive = await CoupleQuizModel.findById(id);

    if (!quizToArchive) {
      return res.status(404).json({ message: "Quiz not found for deletion." });
    }

    // 2. Soft Delete: Create archive entry
    await DeletedQuizModel.create({
      originalId: quizToArchive._id,
      question: quizToArchive.question,
      correctAnswer: quizToArchive.correctAnswer,
      category: quizToArchive.category,
      createdAt: quizToArchive.createdAt,
    });

    // 3. Hard Delete from active model
    await CoupleQuizModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Quiz successfully moved to trash." });
  } catch (error) {
    console.error("Soft Delete Quiz Error:", error.message);
    res.status(500).json({ message: "Server error during soft deletion." });
  }
};

// --- 2. VIEW DELETED QUIZZES CONTROLLER (GET) ---
const viewDeletedQuizzes = async (req, res) => {
  try {
    const deletedQuizzes = await DeletedQuizModel.find().sort({
      deletedAt: -1,
    });
    console.log(deletedQuizzes)
    res.status(200).json({ deletedQuizzes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching deleted quizzes." });
  }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeleteQuiz = async (req, res) => {
  try {
    const { id } = req.params; // ID from the DeletedQuizModel

    const permanentlyDeleted = await DeletedQuizModel.findByIdAndDelete(id);

    if (!permanentlyDeleted) {
      return res
        .status(404)
        .json({ message: "Deleted quiz entry not found in trash." });
    }

    res.status(200).json({ message: "Quiz permanently deleted from trash." });
  } catch (error) {
    console.error("Permanent Delete Quiz Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error during permanent deletion." });
  }
};

export {
  generateQuestion,
  saveAnsweredQuestion,
  viewQuestions,
  deleteQuiz,
  viewDeletedQuizzes,
  permanentlyDeleteQuiz,
};
