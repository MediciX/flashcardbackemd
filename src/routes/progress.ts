import express from "express"
import { authenticate } from "../middleware/auth"
import { getProgressInDeck, updateProgress } from "../controller/ProgressController"

const router = express.Router()

router.get("/:deckId", authenticate, getProgressInDeck)
router.patch("/:cardId", authenticate, updateProgress)

export default router