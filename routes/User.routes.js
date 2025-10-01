import express from "express";
import {
  reqisterUser,
  loginUser,
  logoutUser,
  requestPasswordToken,
  resetPassword,
  getUserDetails,
  changePassword,
  updateUserProfile,
  getALLUserDetails,
  getSingleUserDetails,
  chaneUserRole,
  deleteUser,
  createreview,
  getAllreviews,
  deleteReview,
} from "../controllers/Usercontroller.js";

import {
  Authorization,
  roleBasedAccess,
} from "../middlewares/Authorizationmiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/registeruser").post(upload.single("avatar"), reqisterUser);
router.route("/login-user").post(loginUser);
router.route("/logout-user").post(logoutUser);
router.route("/password/forgot").post(requestPasswordToken);

router.route("/reset/:token").post(resetPassword);
router.route("/profile").get(Authorization, getUserDetails);
router.route("/password/update").put(Authorization, changePassword);
router
  .route("/update/profile")
  .put(Authorization, upload.single("avatar"), updateUserProfile);

router
  .route("/admin/users")
  .get(Authorization, roleBasedAccess("admin"), getALLUserDetails);

router
  .route("/admin/user/:id")
  .get(Authorization, roleBasedAccess("admin"), getSingleUserDetails)

  .put(Authorization, roleBasedAccess("admin"), chaneUserRole)

  .delete(Authorization, roleBasedAccess("admin"), deleteUser);

router.route("/review").put(Authorization, createreview);
  
router.route("/reviews")
  .get(Authorization, roleBasedAccess("admin"),getAllreviews)
  .delete(Authorization, roleBasedAccess("admin"),deleteReview);

export default router;
