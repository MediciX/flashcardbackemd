import express from 'express';
import { getUserDecks , createDeck, updateDeck, deleteDeck, importDeck, exportDeck } from '../controller/DeckController';
import { authenticate } from "../middleware/auth";
import { validateCreateDeck } from "../validators/deckValidator";
import { validate } from "../middleware/validate";

const router = express.Router()

router.post("/", authenticate, validateCreateDeck, validate, createDeck);
router.get("/", authenticate, getUserDecks)
router.patch("/:id", authenticate, validateCreateDeck, validate, updateDeck);
router.delete("/:id", authenticate, deleteDeck)
router.get("/:deckId/export", authenticate, exportDeck);
router.post("/import", authenticate, importDeck);

export default router
