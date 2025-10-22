// src/models/CoupleComic.model.js (Using ES module syntax)

import mongoose from "mongoose";

const CoupleComicSchema = mongoose.Schema({
    theme: {
        type: String, // The user input (key moment/theme)
        required: true,
        trim: true,
    },
    comicTitle: {
        type: String,
        required: true,
    },
    // Storing the comic as an array of objects for panels
    panels: [
        {
            panelNumber: { type: Number, required: true },
            setting: { type: String, required: true },
            dialogue: { type: String, required: true },
        }
    ],
    // The date the comic was created
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const CoupleComicModel = mongoose.model("CoupleComic", CoupleComicSchema);
export default CoupleComicModel;