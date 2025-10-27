import express from "express";
import { add, view , deleteNote, viewDeletedNotes, permanentlyDeleteNote} from "../controllers/DailyNotes.controller.js";
const router = express.Router();



router.post("/add", add)
router.get('/view', view)
router.delete('/delete/:id', deleteNote);
router.get("/view-all-deleted-notes", viewDeletedNotes); 
router.delete("/permanently-delete/:id", permanentlyDeleteNote);

export default router;