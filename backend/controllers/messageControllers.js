const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    res.status(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    console.log("1");
    var message = await Message.create(newMessage);
    console.log("2");

    // populating the message (sender)
    message = await message.populate("sender", "name pic");
    console.log("3");
    console.log(message);

    // populating the message (chat)
    message = await message.populate("chat");
    console.log(message);
    console.log("4");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    console.log("5");
    // update the latest chat
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
  console.log("6");
});
const reciveMessage = expressAsyncHandler(async (req, res) => {
  try {
    const message = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, reciveMessage };
