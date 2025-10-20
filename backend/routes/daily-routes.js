import express from "express";
import { add, view , del} from "../controllers/DailyNotes.controller.js";
const router = express.Router();



router.post("/add", add)
router.get('/view', view)
router.delete('/delete/:id', del)

export default router;