const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

// Admin only
router.post("/", auth, isAdmin, productController.createProduct);

// Public
router.get("/all", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;