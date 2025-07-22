import express from 'express';
import { getDecks, createDeck, deleteDeck } from '../controller/DeckController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// กำหนด route ต่าง ๆ ที่เกี่ยวข้องกับ deck
router.get('/', authenticate, getDecks);
router.post('/', authenticate, createDeck);
router.delete('/:id', authenticate, deleteDeck);

export default router;
