import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db';

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.get('/', (_, res) => {
  res.send('Server running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
