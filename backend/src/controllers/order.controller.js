const orderService = require("../services/order.service");

const createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const order = await orderService.createOrder(
      req.user._id,
      productId,
      quantity
    );

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
};