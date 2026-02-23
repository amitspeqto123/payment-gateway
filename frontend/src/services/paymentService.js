
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const createOrder = (amount) => {
  const token = localStorage.getItem("token"); // ya jahan token store ho
  return axios.post(
    `${API}/payment/order-payment`,
    { amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const verifyPayment = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API}/payment/verify-payment`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};