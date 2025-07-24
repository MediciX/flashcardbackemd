import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import mongoose from "mongoose";
import Card from "../models/CardsModel";
import Deck from "../models/DecksModel";

//GET /api/cards/:deckId
export const getCardsInDeck = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { deckId } = req.params;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck) return res.status(404).json({ message: "Deck not found" });

    const cards = await Card.find({ deckID: deckId });
    res.json(cards);
  } catch (error) {
    console.error("Get Cards Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//POST /api/cards/:deckId
export const createCard = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const deckId = req.params.deckId;
  const { front, back } = req.body;

  if (!front || !back)
    return res.status(400).json({ message: "Front and Back are required" });

  if (!mongoose.Types.ObjectId.isValid(deckId))
    return res.status(400).json({ message: "Invalid deck ID" });

  try {
    const deck = await Deck.findOne({ _id: deckId, userId });

    if (!deck) return res.status(404).json({ message: "Deck not found" });

    if (role !== "admin" && deck.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to access this deck" });
    }

    const card = await Card.create({ front, back, deckID: deckId });
    res.status(201).json(card);
  } catch (error) {
    console.error("Create Card Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//PATCH /api/cards/:cardId
export const updateCard = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { cardId } = req.params;
  const { front, back } = req.body;

  try {
    const card = await Card.findById(cardId).populate("deckID");

    if (!card || (card.deckID as any).userId.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    card.front = front || card.front;
    card.back = back || card.back;
    await card.save();

    res.json(card);
  } catch (error) {
    console.error("Update Card Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//DELETE /api/cards/:cardId
export const deleteCard = async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === "admin";
  const userId = req.user?.userId;
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId).populate("deckID");
    const deckOwnerId = (card?.deckID as any)?.userId?.toString();

    if (!card || (!isAdmin && deckOwnerId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await card.deleteOne();
    res.json({ message: "Card deleted" });
  } catch (error) {
    console.error("Delete Card Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
