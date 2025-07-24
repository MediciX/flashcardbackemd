import { Response } from "express";
import Progress from "../models/ProgressModel";
import Card from "../models/CardsModel";
import { AuthenticatedRequest } from "../middleware/auth";

export const getProgressInDeck = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const { deckId } = req.params;

  try {
    const cards = await Card.find({ deckID: deckId });

    const cardIds = cards.map((card) => card._id);
    const progress = await Progress.find({
      userID: userId,
      cardID: { $in: cardIds },
    });

    res.json(progress);
  } catch (error) {
    console.error("Get Progress Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProgress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const { cardId } = req.params;
  const { status } = req.body;

  if (!["known", "unknown"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const existing = await Progress.findOneAndUpdate(
      { userID: userId, cardID: cardId },
      { status },
      { new: true, upsert: true }
    );

    res.json(existing);
  } catch (error) {
    console.error("Update Progress Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
