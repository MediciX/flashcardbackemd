import mongoose, { Schema, model, Document } from "mongoose";

export interface IProgress extends Document {
  status: string;
  userID: mongoose.Types.ObjectId;
  cardID: mongoose.Types.ObjectId;
}

export const ProgressSchema = new Schema<IProgress>({
  status: {
    type: String,
    enum: ["known", "unknown"],
    required: true,
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref : "User",
    required: true,
  },
  cardID: {
    type: Schema.Types.ObjectId,
    ref: "Card",
    required: true,
  },
});

export default model<IProgress>("Progress", ProgressSchema);