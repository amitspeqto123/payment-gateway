import React from "react";
//import PaymentButton from "./components/PaymentButton";
import PayPalButton from "./components/PayPallButton";
import PayPalSuccess from "./components/PayPalSuccess";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StripeButton from "./components/StripeButton";
import StripeSuccess from "./components/StripeSuccess";

function App() {
  const testOrder = {
    _id: "699d4440b11dffc6a817215d",
    totalAmount: 160000,
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StripeButton order={testOrder} />} />

        <Route path="/paypal-success" element={<StripeSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
