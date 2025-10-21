// src/models/CoupleQuiz.model.js (Using ES module syntax)

import mongoose from "mongoose";

const CoupleQuizSchema = mongoose.Schema({
    // The AI-generated question text
    question: {
        type: String,
        required: true,
        trim: true,
    },
    // The correct answer to the question (e.g., her favorite color)
    correctAnswer: {
        type: String,
        required: true,
    },
    // The category or topic of the question
    category: {
        type: String,
        default: 'General',
    },
    // The date the quiz was generated
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const CoupleQuizModel = mongoose.model("CoupleQuiz", CoupleQuizSchema);
export default CoupleQuizModel;