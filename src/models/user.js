const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: [4, "Username must be at least 3 characters long"],

      required: [true, "Username is required"],
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
 
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  return token;
};
userSchema.methods.validatePassword = async function (password) {
  const user = this;
console.log(user);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);

module.exports = { User };
