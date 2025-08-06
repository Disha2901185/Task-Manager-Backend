const express = require("express");

const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../src/models/user");

const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth");
const {
  validateEditProfileData,
} = require("../middlewares/normalValidators/validation");

//Get Feed Routes

profileRouter.get("/allfeeds", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//Feed Routes

profileRouter.post("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user) {
      res.status(400).send("User not found");
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//Update user/feed
profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      return res.status(400).send({ message: "Invalid data" });
    }
    const loggedinUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedinUser[key] = req.body[key]));

    await loggedinUser.save();
    res.json({
      data: loggedinUser,
      message: `${loggedinUser.firstName} , Your profile was updated Successfully`,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/edit", async (req, res) => {
  const userId = req.body.userId;
  const { data } = req.body;
  console.log(userId);

  if (!userId) {
    res.status(400).send("User id is required");
  }

  try {
    const Allowed_UPdates = [
      "userId",
      "photoUrl",
      "gender",
      "age",
      "skills",
      "about",
    ];
    const isUpdateAllowed = Object.keys(
      data?.every((k) => Allowed_UPdates.includes(k))
    );
    if (!isUpdateAllowed) {
      res.status(400).send("Invalid update");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);

    if (!user) {
      res.status(400).send("User not found with this id");
    }
    res.status(200).json({
      message: "User Updated successfully",
      data: user,
    });
  } catch (error) {
    // console.log(error.name);
    if (error.name === "ValidationError") {
      for (let field in error.errors) {
        res.status(400).send(`${field}:${error.errors[field].message}`);
      }
    }
    // res.status(400).send(error.message);
  }
});

//Delete the feed user
profileRouter.delete("/feed", async (req, res) => {
  const userid = req.body.userid;
  const user = await User.findByIdAndDelete(userid);

  if (!user) {
    res.status(400).send("User not found with this id");
  }
  console.log(user);
  res.send("User deleted successfully");
});
module.exports = profileRouter;
