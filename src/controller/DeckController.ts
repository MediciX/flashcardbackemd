import { Response } from "express";
import Deck from "../models/DecksModel";
import Card from "../models/CardsModel";
import { AuthenticatedRequest } from "../middleware/auth";

//POST /api/cards/:deckId
export const createDeck = async (req: AuthenticatedRequest, res: Response) => {
  const { deckname, description, isPublic = true } = req.body;
  const userId = (req as any).user.userId;

  try {
    const newDeck = new Deck({ deckname, description, isPublic, userId });
    await newDeck.save();

    res.status(201).json(newDeck);
    console.log("Deck created:", newDeck);
  } catch (error) {
    console.error("[CREATE DECK] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//GET /api/cards/:deckId
export const getUserDecks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = (req as any).user.userId;

  try {
    const decks = await Deck.find({ $or: [{ isPublic: true }, { userId }] });
    res.json(decks);
  } catch (error) {
    console.error("[GET DECKS] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDeckById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    const isOwner = deck.userId.toString() === req.user?.userId;
    const isAdmin = req.user?.role === "admin";

    if (!deck.isPublic && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized to view this deck" });
    }

    res.json(deck);
  } catch (error) {
    console.error("Error getting deck:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//PATCH /api/cards/:cardId
export const updateDeck = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { deckname, isPublic, description } = req.body;
  const userId = (req as any).user.userId;

  try {
    const updated = await Deck.findOneAndUpdate(
      { _id: id, userId },
      { deckname, isPublic, description },
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
export const deleteDeck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const del: any = { _id: req.params.id };

    if (req.user?.role !== "admin") {
      del.userId = req.user?.userId;
    }

    const deleted = await Deck.findOneAndDelete(del);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Deck not found or unauthorized" });
    }

    console.log(`[DELETE] query:`, del);

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
    const newCards = cards.map((card) => ({
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
