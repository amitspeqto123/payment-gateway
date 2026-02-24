const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
//const auth = require("../middlewares/auth.middleware");

router.post("/order-payment", paymentController.createPaymentOrder);
router.post("/verify-payment", paymentController.verifyPayment);
router.post("/webhook", express.json({ type: "*/*" }), paymentController.webhookHandler);

// Paypal Route
router.post("/paypal/create-order", paymentController.createPayPalOrder);
router.post("/paypal/capture-payment", paymentController.capturePayPalPayment)

// Stripe
router.post("/stripe/create-session", paymentController.createStripeCheckoutSession);
router.post("/stripe/webhook", express.raw({ type: "application/json" }), paymentController.stripeWebhook);
module.exports = router;