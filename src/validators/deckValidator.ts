import { body } from "express-validator";

export const validateCreateDeck = [
  body("deckname")
    .trim()
    .notEmpty()
    .withMessage("Deck name is required")
    .isLength({ max: 50 })
    .withMessage("Deck name must be at most 50 characters"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),
];
