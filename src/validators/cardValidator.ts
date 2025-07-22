import { body } from "express-validator";

export const validateCreateCard = [
  body("front")
    .trim()
    .notEmpty()
    .withMessage("Front text is required")
    .isLength({ max: 100 })
    .withMessage("Front text must be at most 100 characters"),

  body("back")
    .trim()
    .notEmpty()
    .withMessage("Back text is required")
    .isLength({ max: 100 })
    .withMessage("Back text must be at most 100 characters"),
];
