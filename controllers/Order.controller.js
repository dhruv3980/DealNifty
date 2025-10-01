import Order from "../models/Order.models.js";
import Product from "../models/Product.models.js";
import User from "../models/User.models.js";

import { ApiError } from "../utils/ApiError.js";
import asynchandler from "../middlewares/asyncHandlermiddleware.js";
import { ApiResponse } from "../utils/Apiresponse.js";

// create a new order
export const createNewOrder = asynchandler(async (req, res, next) => {
 
 
  
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  
     //   !shippingPrice 
   if (
    !shippingInfo ||
     !orderItems ||
     !paymentInfo ||
     !itemPrice ||
     !taxPrice ||
  
    !totalPrice
   ) {
     return next(new ApiError(400, "All fields are required"));
   }


  


if (!req.user || !req.user._id) {
  return next(new ApiError(401, "User not authenticated"));
}



  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  if (!order) {
    return next(new ApiError(400, "order not created"));
  }

  res.status(200).json(new ApiResponse(200, order));
});

// get single order ->admin can access only

export const getSingleOrder = asynchandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ApiError(400, "order id is missing");
  }

  const order = await Order.findById(id).populate("user", "name email");

  if (!order) {
    return next(new ApiError(400, "No order found"));
  }

  return res.status(200).json(new ApiResponse(200, order));
});

// all my orders
export const myOrder = asynchandler(async (req, res, next) => {
  const order = await Order.find({ user: req.user.id });

  if (!order) {
    return next(new ApiError(400, "Order not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "order fetched successfully"));
});

// admin get all the order

export const allOrders = asynchandler(async (req, res, next) => {
  const orders = await Order.find({});
  let totalammount = 0;
  if (!orders) {
    return new ApiError(400, "there is no order");
  }

  orders.forEach((order) => {
    totalammount += order.totalPrice;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { orders, totalammount },
        "order fetched successfully"
      )
    );
});

// status working update order status -> here in this there will be issue it not check the quantity of the product is available or update if the product exist

export const updateOrderStatus = asynchandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  

  if (!order) {
    return next(new ApiError(400, "No order details found"));
  }

  if (order.orderStatus == "Delivered") {
    return next(new ApiError(404, "This order is already delivered "));
  }

  await Promise.all(
    order.orderItems.map((item) => updateQuantity(item.product, item.quantity))
  );

  order.orderStatus = req.body.status;
  if (order.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, order));
});

async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error ("Product not found ");
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// delete order
//   order is deleted that one whose status is marked as delevered and this activity can perform only admin

export const deleteOrder = asynchandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, "Order not found"));
  }

  if (order.orderStatus !== "Delivered") {
    return next(
      new ApiError(400, "This order is under processing, order cant be deleted")
    );
  }

  const result = await Order.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Order deleted successfully"));
  });
