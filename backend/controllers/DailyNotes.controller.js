import DailyNoteModel from "../models/DailyNote.model.js";

const add = async (req, res) => {
    try{
        const {title, content, madeby} = req.body;

        // 2. Simple validation (ensure madeby is present)
        if (!title || !content || !madeby) { // <-- UPDATED: Check for madeby
            return res.status(400).json({ message: 'Title, content, and creator are required. add controller of daily notes' });
        }

        const newNote = DailyNoteModel.create({
            title,
            content,
            madeby
        })

        res.status(201).json({
            message: "New Daily Note is added Successfully",
            newNote : newNote
        })
    }
    catch(error){
        console.log(` Daily Notes ke add controller me error h : ${error.message}`);
        res.status(500).json({
            message : "daily Notes ke add controller me se ye error h"
        })
    }
}

const view = async (req, res) => {
    try{
        const allNotes = await DailyNoteModel.find().sort({ createdAt: -1 })
        if(!allNotes || allNotes.length === 0){
            return res.status(200).json({
                message : "Daily notes ka view controller ke paas koi bhi notes nhi aaye h",
                allNotes : []
            })
        }

        res.status(200).json({
            message : "Daily notes ka view controller ke paas notes aa gye h",
            allNotes : allNotes
        })
    }
    catch(error){
        console.error("Error in view controller:", error);
        return res.status(500).json({
            message: "Server error while fetching notes. in view controller",
            error: error.message
        });
    }
}

const del = async (req, res) => {
    try{
        const daily_note_id = req.params.id;
        console.log(`Attempting to delete note with ID: ${daily_note_id}`);
        const deletedNote = await DailyNoteModel.findByIdAndDelete(daily_note_id);

        if(!deletedNote){
            return res.status(500).json({
                    message : "The note can not be find by del controller in dailynotes controller"
                })
        }

        res.status(200).json({
            message : "The note has been finded and deleted ( dailynote controller )",
            deletedNote : deletedNote
        })
    }
    catch(error){
        console.log(`Error find in daily note controller in del catch block : ${error.message}`);
        res.status(500).json({ 
            message: 'Error find in daily note controller in del catch block', 
            error: error.message 
        });
    }
}


export { add , view, del } 