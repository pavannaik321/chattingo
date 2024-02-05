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

// For error handling

app.use("/api/user", userRoutes);

// for chatting
app.use("/api/chat", chatRoutes);

// for message
app.use("/api/message", messageRoutes);

// -------------------Deployment-----------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  // get the content the frontend index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  // creating api
  app.get("/", (req, res) => {
    res.send("api is running successfully");
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(`sever started in on port ${PORT}`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    // create a new room with user id
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room : " + room);
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) {
        return;
      } else {
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      }
    });

    // off the socket after it is done
    socket.off("setup", () => {
      console.log("User Disconnected");
      socket.leave(userData._id);
    });
  });

  // new socket for typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  // stop typing
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
});
