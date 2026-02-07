
const Joi = require("joi");

exports.registerSchema = Joi.object({
    username: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.updateProfileSchema = Joi.object({
    username: Joi.string().min(2).max(30).optional(),
    password: Joi.string().min(6).optional()
}).min(1);

exports.createOrderSchema = Joi.object({
    items: Joi.array().min(1).items(
        Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().integer().min(1).required()
        })
    ).required()
});

exports.updateOrderSchema = Joi.object({
    status: Joi.string().valid("new", "preparing", "ready", "delivered").required()
});

exports.createProductSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().max(30).optional(),
    description: Joi.string().max(200).optional()
});
