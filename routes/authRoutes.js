const express = require("express");
const {
  validationSignupData,
} = require("../middlewares/normalValidators/validation");
const validator = require("validator");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../src/models/user");

//zod validation route
// app.post("/register", validateUser, (req, res) => {
//   res
//     .status(201)
//     .json({ success: true, message: "User registered successfully!" });
// });

authRouter.post("/signup", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({message:"No data received to register",success:false});
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
      return res.status(400).json({message:`${firstField}: ${message}`,success:false});
    }

    if (error.code === 11000) {
      return res
        .status(400)
        .json({message:`Email already exists: ${error.keyValue.emailId}`, success:false});
    }

    return res
      .status(400)
      .json({message:"Error saving the user - " + (error.message) || "Unknown error", success:false});
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    console.log(emailId, password);

    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Credentials");
    }
    const user = await User.findOne({ emailId: emailId });
    // console.log(user);
    if (!user) {
     return res.status(400).send("Invalid credentials");
    }

    const isPasswordValid = user?.validatePassword(password);
    if (isPasswordValid) {
      //make a jwt token
      const token = await user.getJWT();

   res.setHeader("token", token);


      res
        .status(200)
        .json({ message: "Login Successfull", success: true, data: user,token:token });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Error in Login" + ":" + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send();
});

module.exports = { authRouter };
