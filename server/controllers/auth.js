import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";
import crypto from 'crypto';

const oauth2Client = new OAuth2Client(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.VITE_REDIRECT_URI
);

// Update the googleAuth function
async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name || 'Google User',
        email: payload.email,
        googleId: payload.sub,
        isEmailVerified: true,
        password: crypto.randomBytes(20).toString('hex')
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({ message: "Error generating token" });
    }

    // Send response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token,
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Authentication error"
    });
  }
}

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user exists with better error handling
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Create user with try-catch
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
    } catch (error) {
      console.error("User creation error:", error);
      return res.status(400).json({
        message: "Invalid user data",
      });
    }

    // Generate JWT token first to ensure it works
    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({
        message: "Error generating authentication token",
      });
    }

    // Only try email verification if email service is configured
    try {
      const verificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      user.verificationToken = verificationToken;
      await user.save();

      // Make email sending optional
      if (process.env.EMAIL_SERVICE && process.env.EMAIL_USERNAME) {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await sendEmail({
          email: user.email,
          subject: "Email Verification",
          message: `Please verify your email by clicking: ${verificationUrl}`,
        });
      }
    } catch (error) {
      console.error("Verification email error:", error);
      // Continue registration even if email fails
    }

    // Send response with user data and token
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Login user
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Send response
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

// Verify email
async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid verification token" });
  }
}

// Forgot password
async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: `Reset your password by clicking: ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

// Reset password
async function resetPassword(req, res) {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export {
  register,
  login,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
