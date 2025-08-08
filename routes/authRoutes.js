
const express = require("express");
const {
  validationSignupData,
} = require("../middlewares/normalValidators/validation");
const validator = require("validator");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../src/models/user");

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               emailId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully.
 *       400:
 *         description: Validation error or email already exists.
 */
authRouter.post("/signup", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data received to register", success: false });
    }

    validationSignupData(req);

    const { username, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      emailId,
      password: hashedPassword,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        username: user.username,
        emailId: user.emailId,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];
      const message = error.errors[firstField].message;
      return res.status(400).json({ message: `${firstField}: ${message}`, success: false });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: `Email already exists: ${error.keyValue.emailId}`, success: false });
    }

    return res.status(400).json({ message: "Error saving the user - " + (error.message || "Unknown error"), success: false });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns user and token
 *       400:
 *         description: Invalid credentials or login error
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Credentials");
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      // Optionally: use res.cookie instead of headers for security
      // res.cookie("token", token, { httpOnly: true, secure: true });

      res.status(200).json({
        message: "Login Successful",
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          emailId: user.emailId,
        },
        token,
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Login failed: " + err.message });
  }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { authRouter };

