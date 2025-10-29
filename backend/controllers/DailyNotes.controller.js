import DailyNoteModel from "../models/DailyNote.model.js";
import DeletedNoteModel from "../models/DeletedNote.model.js";

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

const deleteNote = async (req, res) => {
    try{
        const id = req.params.id;
        
        // 1. Find the original note
        const noteToArchive = await DailyNoteModel.findById(id);

        if (!noteToArchive) {
            return res.status(404).json({ message: "Note not found for deletion." });
        }
        
        // 2. Create the archive entry (Soft Delete)
        await DeletedNoteModel.create({
            originalId: noteToArchive._id,
            title: noteToArchive.title,
            content: noteToArchive.content,
            madeby: noteToArchive.madeby,
        });

        // 3. Permanently delete the note from the active model
        await DailyNoteModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Note successfully moved to trash." });
    }
    catch (error) {
        console.error("Soft Delete Error:", error.message);
        res.status(500).json({ message: "Server error during soft deletion." });
    }
}

// --- 2. VIEW DELETED NOTES CONTROLLER (GET) ---
const viewDeletedNotes = async (req, res) => {
    try {
        const deletedNotes = await DeletedNoteModel.find().sort({ deletedAt: -1 }); 
        res.status(200).json({ deletedNotes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching deleted notes." });
    }
};

// --- 3. PERMANENT DELETE CONTROLLER (DELETE) ---
const permanentlyDeleteNote = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedNoteModel
        
        const permanentlyDeleted = await DeletedNoteModel.findByIdAndDelete(id);

        if (!permanentlyDeleted) {
            return res.status(404).json({ message: "Deleted note entry not found in trash." });
        }

        res.status(200).json({ message: "Note permanently deleted from trash." });

    } catch (error) {
        console.error("Permanent Delete Error:", error.message);
        res.status(500).json({ message: "Server error during permanent deletion." });
    }
};


// --- NEW CONTROLLER: RESTORE NOTE (POST) ---
const restoreNote = async (req, res) => {
    try {
        const { id } = req.params; // ID from the DeletedNoteModel
        
        // 1. Find the deleted note entry
        const deletedNoteEntry = await DeletedNoteModel.findById(id);

        if (!deletedNoteEntry) {
            return res.status(404).json({ message: "Note not found in archive." });
        }
        
        // 2. Create the restored note in the active collection, using original data
        await DailyNoteModel.create({
            // Use the data from the archive entry
            title: deletedNoteEntry.title,
            content: deletedNoteEntry.content,
            madeby: deletedNoteEntry.madeby,
            createdAt: deletedNoteEntry.createdAt, // Preserve original creation date
        });

        // 3. Permanently delete the entry from the archive model
        await DeletedNoteModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Note restored to active list!" });

    } catch (error) {
        console.error("Restore Note Error:", error.message);
        res.status(500).json({ message: "Server error during note restoration." });
    }
};

export { add , view, deleteNote, viewDeletedNotes, permanentlyDeleteNote, restoreNote } 