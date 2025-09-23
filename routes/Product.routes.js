import express from "express";
import { Authorization } from "../middlewares/Authorizationmiddleware.js";
import { roleBasedAccess } from "../middlewares/Authorizationmiddleware.js";
const Productrouter = express.Router();
import upload from "../middlewares/multer.js";

import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getSingleProduct,
  updatesingleproduct,
  getALLProduct,
} from "../controllers/Product.contorller.js";

Productrouter.post(
  "/admin/product/create",
  Authorization,
  roleBasedAccess("admin"),
  upload.array('images', 5),
  createProduct
);

Productrouter.route("/admin/product/:id").delete(
  Authorization,
  roleBasedAccess("admin"),
  deleteProduct
);

Productrouter.route("/products").get(getAllProduct);

// removee auth herr
Productrouter.route("/product/:id").get(getSingleProduct);

Productrouter.route("/admin/product/:id").put(
  Authorization,
  roleBasedAccess("admin"),
  updatesingleproduct
);

Productrouter.route("/admin/products").get(
  Authorization,
  roleBasedAccess("admin"),
  getALLProduct
);

Productrouter.route("/review/:productid").put(Authorization);
export default Productrouter;
