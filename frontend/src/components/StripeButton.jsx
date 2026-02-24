import React from "react";


const StripeButton = ({ order }) => {

  const handleStripePayment = async () => {
    const res = await fetch("http://localhost:4000/v1/payment/stripe/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: order._id,
        amount: order.totalAmount  // 1600 rupees → backend me paisa me convert karna
      })
    });

    const data = await res.json();

    if (!data.url) {
      alert("Stripe session creation failed");
      return;
    }

    // Stripe hosted page pe redirect
    window.location.href = data.url;
  };

  return (
    <button
      onClick={handleStripePayment}
      className="bg-purple-600 text-white px-6 py-3 rounded"
    >
      Pay ₹{order.totalAmount} with Stripe
    </button>
  );
};

export default StripeButton;