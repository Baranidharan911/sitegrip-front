"use client"
import React from "react";
import axios from "axios";

const RazorpayButton = ({ amount=1 }) => { // Enter amount to pay
  const loadRazorpay = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      const { data: order } = await axios.post(
        "http://localhost:5000/create-order",
        { amount }
      );

      const options = {
        key: "", //Api Key
        amount: order.amount,
        currency: order.currency,
        name: "Your Company",
        description: "Test Transaction",
        order_id: order.id,
        handler: function (response) {
          alert("Payment successful!");
          console.log("Razorpay response:", response);
        },
        prefill: {
          name: "Akash",
          email: "akash@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error", err);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <button
      onClick={loadRazorpay}
      className="bg-blue-600 text-white px-4 py-2 rounded-md"
    >
      Pay ₹{amount}
    </button>
  );
};

export default RazorpayButton;
