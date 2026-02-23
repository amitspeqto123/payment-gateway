const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// createPaymentOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       message: "Order created",
//       razorpayOrder: order,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body; // orderId wo jo user ne /orders/create-order se banaya

    const options = {
      amount: amount * 100, // paisa paise me
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // DB me update karo existing order ke saath
    const order = await Order.findByIdAndUpdate(
      orderId,
      { razorpayOrderId: razorpayOrder.id },
      { new: true },
    );

    res.status(200).json({
      message: "Razorpay order created",
      razorpayOrder,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manually verify payments
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Yaha DB me payment SUCCESS mark karte hain
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Automatic Razorpay update status

const webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Razorpay sends raw body for signature verification
    const body = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature === expectedSignature) {
      const event = req.body.event;
      const payload = req.body.payload;

      // Payment captured event
      if (event === "payment.captured") {
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.order_id;
        const amount = payload.payment.entity.amount;

        // ✅ DB update
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { status: "paid", razorpayPaymentId: paymentId, totalAmount: amount },
        );

        console.log(`Order ${razorpayOrderId} updated to paid`);
      }

      res.status(200).json({ status: "ok" });
    } else {
      res.status(400).json({ status: "invalid signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};
module.exports = {
  createPaymentOrder,
  verifyPayment,
  webhookHandler,
};
