
const Order = require("../models/order");
const Product = require("../models/product");

async function ensureProductsExist() {
    const count = await Product.countDocuments();
    if (count > 0) return;

    await Product.insertMany([
        { name: "Espresso", price: 900, category: "Coffee", description: "Strong shot" },
        { name: "Cappuccino", price: 1200, category: "Coffee", description: "With milk foam" },
        { name: "Latte", price: 1300, category: "Coffee", description: "Soft and milky" },
        { name: "Cheesecake", price: 1500, category: "Dessert", description: "Sweet slice" }
    ]);
}

exports.getMenu = async (req, res, next) => {
    try {
        await ensureProductsExist();
        const products = await Product.find({ available: true }).sort({ createdAt: -1 });
        res.json({ products });
    } catch (err) {
        next(err);
    }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price) {
      res.status(400);
      throw new Error("name and price are required");
    }

    const product = await Product.create({
      name,
      price,
      category: category || "Coffee",
      description: description || ""
    });

    res.status(201).json({
      message: "Product created",
      product
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
    try {
        await ensureProductsExist();

        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error("items array is required");
        }

        let total = 0;
        const orderItems = [];

        for (const it of items) {
        const { productId, qty } = it;

        if (!productId || !qty || qty < 1) {
            res.status(400);
            throw new Error("Each item must have productId and qty >= 1");
        }

        const product = await Product.findById(productId);
        if (!product || !product.available) {
            res.status(404);
            throw new Error("Product not found or unavailable");
        }

        total += product.price * qty;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            qty
        });
        }

        const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalPrice: total,
        status: "new"
        });

        res.status(201).json({ message: "Order created", order });
    } catch (err) {
        next(err);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        next(err);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
        res.status(404);
        throw new Error("Order not found");
        }

        if (String(order.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Access denied");
        }

        res.json({ order });
    } catch (err) {
        next(err);
    }
};

exports.updateOrder = async (req, res, next) => {
    try {
        const { status } = req.body;
        const allowed = ["new", "preparing", "ready", "delivered"];

        if (!status || !allowed.includes(status)) {
        res.status(400);
        throw new Error(`status must be one of: ${allowed.join(", ")}`);
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
        res.status(404);
        throw new Error("Order not found");
        }

        if (String(order.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Access denied");
        }

        order.status = status;
        await order.save();

        res.json({ message: "Order updated", order });
    } catch (err) {
        next(err);
    }
};

exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
        res.status(404);
        throw new Error("Order not found");
        }

        if (String(order.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Access denied");
        }

        await order.deleteOne();
        res.json({ message: "Order deleted" });
    } catch (err) {
        next(err);
    }
};
