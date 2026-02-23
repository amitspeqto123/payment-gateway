const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
//const auth = require("../middlewares/auth.middleware");

router.post("/order-payment", paymentController.createPaymentOrder);
router.post("/verify-payment", paymentController.verifyPayment);
router.post("/webhook", express.json({ type: "*/*" }), paymentController.webhookHandler);

module.exports = router;