import React from "react";


const PayPalButton = ({ order }) => {

  const handlePayment = async () => {
    const res = await fetch("http://localhost:4000/v1/payment/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.totalAmount,
        orderId: order._id
      })
    });

    const data = await res.json();
    console.log("PAYPAL RESPONSE:", data);

    // approve link find karo
    const approveLink = data.links.find(link => link.rel === "approve").href;
    

    window.location.href = approveLink;
  };

  return (
    <button onClick={handlePayment} className="text-green-400 bg-black p-4 rounded-sm">
      Pay with PayPal
    </button>
  );
};

export default PayPalButton;