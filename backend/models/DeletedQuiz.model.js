// src/models/DeletedQuiz.model.js

import mongoose from "mongoose";

const DeletedQuizSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    category: { type: String, default: "General" },
    createdAt: { type: Date },
    deletedAt: { type: Date, default: Date.now }
});

const DeletedQuizModel = mongoose.model("DeletedQuiz", DeletedQuizSchema);
export default DeletedQuizModel;
