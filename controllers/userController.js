
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res, next) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
        res.status(404);
        throw new Error("User not found");
        }

        if (username) user.username = username;

        if (password) {
        if (password.length < 6) {
            res.status(400);
            throw new Error("Password must be at least 6 characters");
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({
        message: "Profile updated",
        user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        next(err);
    }
};
