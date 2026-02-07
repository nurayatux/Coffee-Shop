
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });
}

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
        res.status(400);
        throw new Error("username, email, and password are required");
        }
        if (!isEmail(email)) {
        res.status(400);
        throw new Error("Invalid email format");
        }
        if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
        }

        const existing = await User.findOne({ email });
        if (existing) {
        res.status(400);
        throw new Error("Email already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hashed });

        const token = signToken(user._id);

        res.status(201).json({
        message: "User registered",
        token,
        user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        res.status(400);
        throw new Error("email and password are required");
        }

        const user = await User.findOne({ email });
        if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
        res.status(401);
        throw new Error("Invalid credentials");
        }

        const token = signToken(user._id);

        res.json({
        message: "Login success",
        token,
        user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        next(err);
    }
};
