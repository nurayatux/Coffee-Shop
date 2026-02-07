const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const orderCtrl = require("../controllers/orderController");

const { validate } = require("../middleware/validate");
const {
    createOrderSchema,
    updateOrderSchema,
    createProductSchema
} = require("../middleware/schemas");

router.get("/menu", orderCtrl.getMenu);

router.post("/menu", auth, validate(createProductSchema), orderCtrl.createProduct);

router.post("/", auth, validate(createOrderSchema), orderCtrl.createOrder);
router.get("/", auth, orderCtrl.getMyOrders);
router.get("/:id", auth, orderCtrl.getOrderById);
router.put("/:id", auth, validate(updateOrderSchema), orderCtrl.updateOrder);
router.delete("/:id", auth, orderCtrl.deleteOrder);

module.exports = router;
