import express from "express";
import { generateQuestion, viewQuestions,saveAnsweredQuestion, deleteQuestion } from "../controllers/CoupleQuiz.controller.js";
const router = express.Router();

// 1. POST Route for generating and saving a question
router.post("/generate", generateQuestion);

router.post("/save-answer", saveAnsweredQuestion);

// 2. GET Route for viewing all questions
router.get("/view", viewQuestions);

// 3. DELETE Route for deleting a question by ID
router.delete("/delete/:id", deleteQuestion);

export default router;