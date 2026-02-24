import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PayPalSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const orderId = searchParams.get("orderId");

    const capturePayment = async () => {
      await fetch("http://localhost:4000/v1/payment/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId: token,
          localOrderId: orderId
        })
      });
    };

    capturePayment();
  }, []);

  return <h2>Payment Successful 🎉</h2>;
};

export default PayPalSuccess;