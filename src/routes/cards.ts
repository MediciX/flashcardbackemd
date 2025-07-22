import express from 'express';
import { getCardsInDeck , createCard, updateCard, deleteCard } from '../controller/CardController';
import { authenticate } from "../middleware/auth";
import { validateCreateCard } from "../validators/cardValidator";
import { validate } from "../middleware/validate";

const router = express.Router()

router.get("/:deckId", authenticate, getCardsInDeck);       // GET cards in deck
router.post("/:deckId", authenticate, validateCreateCard, validate, createCard);
router.patch("/:cardId", authenticate, validateCreateCard, validate, updateCard);
router.delete("/:cardId", authenticate, deleteCard);        // DELETE card

export default router
