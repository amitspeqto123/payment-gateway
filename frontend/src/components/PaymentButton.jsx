import { useRazorpay } from "../hooks/useRazorpay";
import React from "react";


const PaymentButton = () => {
  const { initiatePayment } = useRazorpay();

  return (
    <button onClick={() => initiatePayment(1600)} className="bg-red-400 text-black p-4 rounded-sm ">
      Pay ₹1600
    </button>
  );
};

export default PaymentButton;