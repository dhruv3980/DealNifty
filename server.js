import express from "express";
import cors from "cors";
import Productrouter from "./routes/Product.routes.js";
import User from "./routes/User.routes.js";
import Order from "./routes/Order.routes.js";

import Payment from "./routes/Payment.routes.js";
import ErrorHandlemiddleware from "./middlewares/ErrorHandlemiddleware.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";

import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
app.set("trust proxy", 1);

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

process.on("uncaughtException", (err) => {
  console.log(`Error, ${err.message}`);
  console.error("❌  shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

const corsOptions = {
  origin: ["https://dealnifty.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
  credentials: true,allowedHeaders: ["Content-Type", "Authorization"],

};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.options("*", cors());

app.use("/api/v1", Productrouter);
app.use("/api/v1", User);
app.use("/api/v1", Order);
app.use("/api/v1", Payment);

app.use(ErrorHandlemiddleware);

export { app };
