import mongoose, { Schema, model, Document } from "mongoose";

export interface ICard extends Document {
  front: string;
  back: string;
  deckID: mongoose.Types.ObjectId;
}

export const CardSchema = new Schema<ICard>({
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  deckID: {
    type: Schema.Types.ObjectId,
    ref: "Deck",
    required: true,
  },
});

export default model<ICard>("Card", CardSchema);