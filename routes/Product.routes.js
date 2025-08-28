import express from "express"
import { Authorization } from "../middlewares/Authorizationmiddleware.js";
import { roleBasedAccess } from "../middlewares/Authorizationmiddleware.js";
const Productrouter = express.Router();


import { createProduct, deleteProduct, getAllProduct, getSingleProduct, updatesingleproduct, getALLProduct  } from "../controllers/Product.contorller.js";



Productrouter.post('/admin/product/create', Authorization, roleBasedAccess("admin"), createProduct)

Productrouter.route('/admin/product/:id').delete(Authorization, roleBasedAccess("admin"),deleteProduct);

Productrouter.route('/products').get(getAllProduct);

Productrouter.route('/product/:id').get(Authorization, getSingleProduct);

Productrouter.route('/admin/product/:id').put(Authorization, roleBasedAccess("admin"),updatesingleproduct)

Productrouter.route('/admin/products').get(Authorization, roleBasedAccess('admin'), getALLProduct)

Productrouter.route('/review/:productid').put(Authorization, )
export default Productrouter;