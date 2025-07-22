import { Request, Response } from "express";
import Deck from "../models/DecksModel";
import Card from "../models/CardsModel";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const getDecks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userID = req.user?.userId;
    const decks = await Deck.find({
      $or: [
        { userID }, //ของผู้ใช้เอง
        { isPublic: true },
      ],
    });
    res.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    res.status(500).json({ message: "Failed to get decks" });
  }
};

export const createDeck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userID = req.user?.userId;
    const { deckname } = req.body;

    if (!deckname) {
      return res.status(400).json({ message: "Deck name is required" });
    }

    const newDeck = new Deck({ deckname, userID });
    await newDeck.save();

    res.json(newDeck);
  } catch (error) {
    console.error("Error creating deck:", error);
    res.status(500).json({ message: "Failed to create deck" });
  }
};

export const deleteDeck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const deckId = req.params.id;

    const deck = await Deck.findById(deckId);
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    if (deck.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Deck.findByIdAndDelete(deckId);
    await Card.deleteMany({ deckId });

    res.json({ message: "Deck and cards deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete deck" });
  }
};
