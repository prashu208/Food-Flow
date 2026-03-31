const Order = require("../models/Order");


// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { userId, userName, items, totalPrice, deliveryAddress, notes } = req.body;

    if (!userId || !items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ error: "userId, items, and totalPrice are required." });
    }

    const order = new Order({
      userId,
      userName,
      items,
      totalPrice,
      deliveryAddress,
      notes
    });

    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET USER ORDERS
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET ALL ORDERS (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ UPDATE STATUS (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};