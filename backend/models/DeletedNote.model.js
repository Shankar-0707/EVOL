// src/models/DeletedNote.model.js
import mongoose from "mongoose";
import DailyNoteModel from "./DailyNote.model.js"; // Import the original model for reference

// Create a schema that mirrors the DailyNote model
const DeletedNoteSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    madeby: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    }
});

const DeletedNoteModel = mongoose.model("DeletedNote", DeletedNoteSchema);
export default DeletedNoteModel;