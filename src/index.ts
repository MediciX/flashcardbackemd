import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db';
import deckRoutes from './routes/decks';
import cardRoutes from './routes/cards';
import userRoutes from './routes/users'
import progressRoutes from './routes/progress';
import cors from "cors";

connectDB();

const app = express();

export const JWT_KEY = process.env.JWT_KEY;
if (!JWT_KEY) {
  throw new Error("JWT_KEY is missing in environment variables");
}

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get('/', (_, res) => {
  res.send('API running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use('/api', userRoutes)
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes)
app.use('/api/progress', progressRoutes);
