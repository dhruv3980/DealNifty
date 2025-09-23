import express from "express";
const router = express.Router();

import {
  Authorization,
  roleBasedAccess,
} from "../middlewares/Authorizationmiddleware.js";
import {
  allOrders,
  createNewOrder,
  deleteOrder,
  getSingleOrder,
  myOrder,
  updateOrderStatus,
} from "../controllers/Order.controller.js";

router.route("/new/order").post(Authorization, createNewOrder);
router
  .route("/order/:id")
  .get(Authorization,  getSingleOrder);

router.route("/orders/user").get(Authorization, myOrder);

router
  .route("/admin/orders")
  .get(Authorization, roleBasedAccess("admin"), allOrders);

router
  .route("/admin/order/:id")
  .put(Authorization, roleBasedAccess("admin"), updateOrderStatus)
  .delete(deleteOrder);

//  router.route('/order:id')
//  .get(Authorization, getSingleOrder) 

export default router;
