
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, validate(updateProfileSchema), updateProfile);

module.exports = router;
