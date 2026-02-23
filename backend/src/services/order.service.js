const Order = require("../models/order.model");
const Product = require("../models/product.model");

const createOrder = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  const totalAmount = product.price * quantity;

  const order = await Order.create({
    user: userId,
    product: productId,
    quantity,
    totalAmount,
  });

  return order;
};

module.exports = {
  createOrder,
};