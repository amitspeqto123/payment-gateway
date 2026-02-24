const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.model");
const payPalClient = require("../utils/payPalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const stripe = require("../utils/stripe")

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

// paypal integraation
const createPayPalOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (amount / 100).toFixed(2), // PayPal me dollars
          },
        },
      ],
      application_context: {
        brand_name: "Your Store",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `https://yourfrontend.com/paypal-success?orderId=${orderId}`,
        cancel_url: `https://yourfrontend.com/paypal-cancel?orderId=${orderId}`,
      },
    });

    const order = await payPalClient.execute(request);
    res.status(200).json(order.result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const capturePayPalPayment = async (req, res) => {
  try {
    const { paypalOrderId, localOrderId } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(
      paypalOrderId,
    );
    request.requestBody({});
    const capture = await payPalClient.execute(request);

    if (capture.statusCode === 201 || capture.statusCode === 200) {
      // DB update
      await Order.findByIdAndUpdate(localOrderId, {
        status: "paid",
        paypalPaymentId:
          capture.result.purchase_units[0].payments.captures[0].id,
        gateway: "paypal",
      });

      res.status(200).json({ message: "Payment successful" });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stripe integration
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Order Payment",
            },
            unit_amount: amount, // amount in paisa
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/stripe-success?orderId=${orderId}`,
      cancel_url: `http://localhost:5173/stripe-cancel?orderId=${orderId}`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
const stripeWebhook = async (req, res) => {
  const stripe = require("../config/stripe");

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const orderId = session.success_url.split("orderId=")[1];

    // DB me order status update karo
    console.log("Payment Successful for Order:", orderId);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  webhookHandler,
  createPayPalOrder,
  capturePayPalPayment,
  createStripeCheckoutSession,
  stripeWebhook,
};
