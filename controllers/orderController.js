const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const order = new Order({ userId: req.user.userId, products, totalAmount });
    await order.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
