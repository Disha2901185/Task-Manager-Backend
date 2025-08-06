const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../src/models/connectionRequest.model");
const { User } = require("../src/models/user");

const userRouter = express.Router();
const SAFE_USER = "firstName lastName age gender photoUrl skills about";
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "skills",
      "about",
    ]);

    if (connectionRequest.length == 0) {
      res.status(400).json({
        message: "No request available",
      });
    }
    res.status(200).json({
      message: "Connection requests found",
      data: connectionRequest,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", SAFE_USER)
      .populate("toUserId", SAFE_USER);

    if (connectionRequest.length == 0) {
      res.status(400).json({
        message: "No request available",
      });
    }
    const data = connectionRequest
      .map((row) => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
          return row.toUserId; // Get the opposite user
        } else if (
          row.toUserId._id.toString() === loggedInUser._id.toString()
        ) {
          return row.fromUserId; // Get the opposite user
        }
      })
      .filter(Boolean); // Removes any undefined values

    res.status(200).json({
      message: "Connection requests found",
      data: data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    //PAGINATION
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit > 50 ? 50 : limit;
    const skit = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set(); //contain all unique entries

    connectionRequest.fromEach((item) => {
      hideUsersFromFeed.add(item.fromUserId.toString());
      hideUsersFromFeed.add(item.toUserId.toString());
    });

    console.log(hideUsersFromFeed);

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select(SAFE_USER)
      .skip(skit)
      .limit(limit);

    res.status(200).json({
      message: "Users found",
      data: users,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = { userRouter };
