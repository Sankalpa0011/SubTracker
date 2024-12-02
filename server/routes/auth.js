import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "../controllers/auth.js";
import {
  getGmailAuthUrl,
  handleGmailCallback,
} from "../controllers/gmailAuth.js";

const router = express.Router();

const errorHandler = (err, req, res, next) => {
  console.error("Auth Error:", err);
  res.status(500).json({
    message: "Authentication error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

// Validation middleware
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google", googleAuth);

// Gmail routes
router.get("/gmail/url", protect, getGmailAuthUrl);
router.post("/gmail/callback", protect, handleGmailCallback);

router.use(errorHandler);

export default router;
