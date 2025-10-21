import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import dailyNotesRoutes from "./routes/daily-routes.js";
import oursongsRoutes from "./routes/oursongs-routes.js"
import memoryRoutes from "./routes/memories-routes.js"
import galleryRoutes from "./routes/gallery-routes.js"


dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // if you're using cookies or HTTP authentication
}));
app.use(express.json());

app.use("/daily-notes", dailyNotesRoutes);
app.use("/our-songs",oursongsRoutes);
app.use('/our-memories', memoryRoutes);
app.use('/our-gallery', galleryRoutes);

app.listen(PORT, ()=> console.log(`Server Started on port : ${PORT}`));