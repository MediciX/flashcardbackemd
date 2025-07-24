import mongoose from "mongoose";
import { Request, Response } from "express";
import Deck from "../models/DecksModel";
import Card from "../models/CardsModel";
import { AuthenticatedRequest } from "../middleware/auth";

//POST /api/cards/:deckId
export const createDeck = async (req: Request, res: Response) => {
  const { deckname, isPublic = true } = req.body;
  const userId = (req as any).user.userId;

  try {
    const newDeck = new Deck({ deckname, isPublic, userId });
    await newDeck.save();

    res.status(201).json(newDeck);
    console.log("Deck created:", newDeck);
  } catch (error) {
    console.error("[CREATE DECK] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//GET /api/cards/:deckId
export const getUserDecks = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const decks = await Deck.find({ $or: [ { isPublic: true }, { userId } ] });
    res.json(decks);
  } catch (error) {
    console.error("[GET DECKS] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//PATCH /api/cards/:cardId
export const updateDeck = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { deckname, isPublic } = req.body;
  const userId = (req as any).user.userId;

  try {
    const updated = await Deck.findOneAndUpdate(
      { _id: id, userId },
      { deckname, isPublic },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Deck not found or unauthorized" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[UPDATE DECK] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//DELETE /api/cards/:cardId
export const deleteDeck = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  try {
    const deleted = await Deck.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Deck not found or unauthorized" });
    }

    res.json({ message: "Deck deleted successfully" });
  } catch (error) {
    console.error("[DELETE DECK] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const exportDeck = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { deckId } = req.params;

  try {
    const deck = await Deck.findOne({ _id: deckId });
    if (!deck) return res.status(404).json({ message: "Deck not found" });

    if (deck.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const cards = await Card.find({ deckID: deckId });

    const exportData = {
      deck: {
        _id: deck._id,
        deckname: deck.deckname,
        isPublic: deck.isPublic,
      },
      cards: cards.map((card) => ({
        _id: card._id,
        front: card.front,
        back: card.back,
      })),
    };

    res.json(exportData);
  } catch (error) {
    console.error("Export Deck Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const importDeck = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { deck, cards } = req.body;

  if (!deck || !cards || !Array.isArray(cards)) {
    return res.status(400).json({ message: "Invalid import data" });
  }

  try {
    // สร้าง Deck ใหม่ (ยึด userId เป็นเจ้าของ)
    const newDeck = new Deck({
      deckname: deck.deckname || "Untitled Deck",
      userId: userId,
      isPublic: deck.isPublic ?? true,
    });
    await newDeck.save();

    // สร้าง Cards ใหม่ ใส่ deckID ใหม่
    const newCards = cards.map(card => ({
      front: card.front,
      back: card.back,
      deckID: newDeck._id,
    }));

    await Card.insertMany(newCards);

    res.status(201).json({ message: "Import successful", deck: newDeck });
  } catch (error) {
    console.error("Import Deck Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};