const express = require("express");
// const dontenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// dontenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); //to accept json data form frontend

// creating api
app.get("/", (req, res) => {
  res.send("api is running successfully");
});

// For error handling

app.use("/api/user", userRoutes);

// for chatting
app.use("/api/chat", chatRoutes);

// for message
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, console.log(`sever started in on port ${PORT}`));
