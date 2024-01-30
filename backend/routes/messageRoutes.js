const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  reciveMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

// routers for messages
// posting data
router.route("/").post(protect, sendMessage);

// getting data
router.route("/:chatId").get(protect, reciveMessage);

module.exports = router;
