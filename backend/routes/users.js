const express = require("express");
const { getUsers, getUserProfile, updateUser } = require("../controllers/usersController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUserProfile);
router.patch("/:userId", updateUser);

module.exports = router;
