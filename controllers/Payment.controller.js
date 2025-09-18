import ErrorHandlemiddleware from "../middlewares/ErrorHandlemiddleware.js";
import asynchandler from "../middlewares/asyncHandlermiddleware.js";
import { instance } from "../server.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import crypto from "crypto";

export const processPayment = asynchandler(async (req, res, next) => {
  
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

// send api key
export const sendApiKey = asynchandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { key: process.env.RAZORPAY_API_KEY }));
});

// payment verification
export const paymentVerification = asynchandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  

  if (isAuthentic) {
    return res.status(200).json({
      success: true,
      message: "Payment verifed Successfully",
      reference: razorpay_payment_id,
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "Payment Failed",
    });
  }
});
