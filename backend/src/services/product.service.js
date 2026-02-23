const Product = require("../models/product.model");

const createProduct = async (body, userId) => {
  const product = await Product.create({
    ...body,
    createdBy: userId,
  });

  return product;
};

const getAllProducts = async () => {
  return Product.find().populate("createdBy", "name email");
};

const getProductById = async (id) => {
  return Product.findById(id);
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};