const jwt = require("jsonwebtoken");
const { User } = require("../src/models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    // 1. Read the token
    // console.log(req.headers.authorization, "...............");

  const token = req?.headers?.authorization?.split(" ")[1];
    // console.log("Token received:", token);

    if (!token) {
      throw new Error("Token is missing or invalid");
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Decoded JWT:", decoded);

    if (!decoded || !decoded._id) {
      throw new Error("Invalid token structure");
    }

    // 3. Fetch User
    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found. Please authenticate." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res
      .status(401)
      .json({ error: error.message || "Please authenticate." });
  }
};

module.exports = { userAuth };
