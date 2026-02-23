const express = require("express");
const authRoute = require("./routes/auth.route");
const productRoute = require("./routes/product.route");
const orderRoute = require("./routes/order.route");
const paymentRoute = require("./routes/payment.route");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());
// routes

app.use("/v1/auth", authRoute);
app.use("/v1/products", productRoute);
app.use("/v1/orders", orderRoute);
app.use("/v1/payment", paymentRoute);

module.exports = app;