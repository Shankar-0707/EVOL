import mongoose from "mongoose";

const DailyNoteSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,       // Title mandatory
  },
  content: {
    type: String,
    required: true,       // Note content mandatory
  },
  createdAt: {
    type: Date,
    default: Date.now,    // Auto timestamp
  },
  madeby:{
    type:String,
    required: true
  }
});

// Export model
const DailyNoteModel =  mongoose.model("Note", DailyNoteSchema);
export default DailyNoteModel