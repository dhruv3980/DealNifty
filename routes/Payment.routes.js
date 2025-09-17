import express from "express";
import { Authorization } from "../middlewares/Authorizationmiddleware.js";
import {
  paymentVerification,
  processPayment,
  sendApiKey,
} from "../controllers/Payment.controller.js";
const router = express.Router();

router.route("/payment/process").post(Authorization, processPayment);

router.route("/getkey").get(Authorization, sendApiKey);

router.route("/payment/verification").post(paymentVerification);

export default router;
