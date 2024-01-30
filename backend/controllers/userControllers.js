const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

// user registeration
const registerUser = asyncHandler(async (req, res) => {
  let { name, email, password, pic } = req.body;

  const salt = await bcrypt.genSalt(saltRounds);
  console.log("b1");
  password = await bcrypt.hash(password, salt);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

// user login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const DbUser = await User.findOne({ email });

  if (DbUser && (await bcrypt.compare(password, DbUser.password))) {
    res.status(200).json({
      _id: DbUser._id,
      name: DbUser.name,
      email: DbUser.email,
      pic: DbUser.pic,
      token: generateToken(DbUser._id),
    });
  } else {
    res.status(400);
    throw new Error("User doesn't exist or incorrect password");
  }
});

// /api/user?search=pavan   ... send using queries

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: { $regex: req.query.search, $options: "i" },
            email: { $regex: req.query.search, $options: "i" },
          },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
};
