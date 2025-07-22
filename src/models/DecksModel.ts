import mongoose, { Schema, model, Document } from "mongoose";

export interface IDeck extends Document {
  deckname: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
}

const DeckSchema = new Schema<IDeck>({
  deckname: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
    required: true,
  },
}, { versionKey: false });

export default model<IDeck>("Deck", DeckSchema, "decks");