import { loadScript } from "../utils/loadScript";
import { createOrder, verifyPayment } from "../services/paymentService";

export const useRazorpay = () => {

  const initiatePayment = async (amount) => {

    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      throw new Error("Razorpay SDK failed to load");
    }

    const { data } = await createOrder(amount);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: data.razorpayOrder.amount,
      currency: "INR",
      order_id: data.razorpayOrder.id,

      handler: async (response) => {
        await verifyPayment(response);
        alert("Payment Successful ✅");
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return { initiatePayment };
};