import express from "express";
import Productrouter from "./routes/Product.routes.js";
import User from "./routes/User.routes.js"
import Order from "./routes/Order.routes.js";
import ErrorHandlemiddleware from "./middlewares/ErrorHandlemiddleware.js";
import cookieParser from "cookie-parser";


const app = express();


process.on("uncaughtException", (err) => {
  console.log(`Error, ${err.message}`);
  console.error("❌  shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", Productrouter);
app.use('/api/v1', User);
app.use('/api/v1', Order)

app.use(ErrorHandlemiddleware);

export { app };
