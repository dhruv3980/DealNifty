import User from "../models/User.models.js";
import asynchandler from "../middlewares/asyncHandlermiddleware.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { jwthelper } from "../utils/JwttokenSenderhelper.js";
import { sendEMail } from "../utils/sendMail.js";
import crypto from "crypto";
import Product from "../models/Product.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

export const reqisterUser = asynchandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  let file = req.file?.path;

  const publicId ="zuauexwey2dwxwewlhxu"
  const cloud_Name = "dn0uh6v3d"

  let result = await uploadOnCloudinary(file);
  if (!result) {
    result = {
      public_id: publicId,
      url: `https://res.cloudinary.com/${cloud_Name}/image/upload/v1755188575/Youtube/${publicId}`,
    };
  }

  if (!name || !email || !password) {
    return next(new ApiError(400, "Please enter all fields"));
  }

  const data = await User.findOne({ email });

  if (data) {
    return next(new ApiError(401, "user email already exist"));
  }

  const user = await User.create({ name, email, password, avatar: result });

  //    return res.status(201).json(new ApiResponse(201, user, user,"User registered successfully"));
  await jwthelper(user, res, req);
});

export const loginUser = asynchandler(async (req, res, next) => {
  // first check email and password exist or not
  // second user exit or not
  // third compare the password
  // fourth generate jwt token
  // fifth send response

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(401, "please enter email and password"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError(404, "user with this email is not exist"));
  }

  const response = await user.checkPasswordCorrect(password);
  if (!response) {
    return next(new ApiError(401, "please enter correct email and password"));
  }

  await jwthelper(user, res, req, "User Logged In successfully");
});

export const logoutUser = asynchandler(async (req, res, next) => {
  let { token } = req.cookies;

  if (!token) {
    return next(new ApiError(404, "unauthorized access"));
  }

  return res
    .clearCookie("token")
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

// request reset password token
export const requestPasswordToken = asynchandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "Please enter email"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(404, "Unauthorized email access"));
  }

  const token = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const url = `http://localhost/ap1/v1/reset/${token}`;
  console.log(url);

  const message = `Use the following link to reset your password : ${url}. \n\n This link will expires in 30 minutes.\n\n if you didnot request a password reset, please ignore this message.`;

  try {
    const options = {
      user: email,
      subject: `Password reset token for the user`,
      message: message,
    };
    await sendEMail(options);
    return res
      .status(200)
      .json(new ApiResponse(200, "Reset email sent successfully"));
  } catch (err) {
    console.log(err);
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ApiError(500, "Email could not be sent please try again later", err)
    );
  }
});

// reset password
export const resetPassword = asynchandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return next(new ApiError(404, "invalid url"));
  }

  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ApiError(400, "Reset Password token is invalid or has been expired")
    );
  }

  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(
      new ApiError(401, "password and confirmPassword doesnot match")
    );
  }

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.password = password;
  await user.save();

  await jwthelper(user, res, req, "password changed successfully");
});

// get user details -> profile
export const getUserDetails = asynchandler(async (req, res, next) => {
  console.log(req.user);
  const id = req.user.id;
  if (!id) {
    return next(new ApiError(401, "unautorized access"));
  }

  const Profile = await User.findById(id);
  if (!Profile) {
    return next(new ApiError(401, "user details not fetched"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, Profile, "User profile details fetched successfully")
    );
});

// changepassword

export const changePassword = asynchandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  console.log(oldPassword, newPassword, confirmPassword);
  if (oldPassword == newPassword && newPassword == confirmPassword) {
    return next(
      new ApiError(
        401,
        "New password must be different from the current password"
      )
    );
  }
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ApiError(401, "password field is missing"));
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new ApiError(500, "something happened"));
  }

  if (!(await user.checkPasswordCorrect(oldPassword))) {
    return next(new ApiError(401, "password is not correct"));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ApiError(401, "new password and confirm password does not match")
    );
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

// update userprofile
export const updateUserProfile = asynchandler(async (req, res, next) => {
  const { email, name } = req.body;

  const options = {};
  if (email) options.email = email;
  if (name) options.name = name;

  const user = await User.findByIdAndUpdate(req.user._id, options, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ApiError(404, "User not found or update failed"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile updated successfully", user));
});

// admin getting user details

export const getALLUserDetails = asynchandler(async (req, res, next) => {
  const userList = await User.find();

  return res
    .status(200)
    .json(new ApiResponse(200, userList, "AllUser is fetched successfully"));
});

// get single user details
export const getSingleUserDetails = asynchandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new ApiError(401, "User id is missing "));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(
      new ApiError(400, "Details you gived not match user not exist")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user detail fetched successfully"));
});

//admin change user role

export const chaneUserRole = asynchandler(async (req, res, next) => {
  const { role } = req.body;
  const id = req.params.id;
  if (!role) {
    return next(new ApiError(400, "role is not defined"));
  }

  const options = {
    role,
  };
  const user = await User.findByIdAndUpdate(id, options, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ApiError(400, "user with the given id  not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user role is updated successfully"));
});

//admin can  delete the user
export const deleteUser = asynchandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new ApiError(400, "id is missing "));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(400, "User not fond "));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, [], "User deleted successully"));
});

// creating review and update
export const createreview = asynchandler(async (req, res, next) => {
  const { rating, comment, productid } = req.body;

  if (!rating || !comment || !productid) {
    return next(new ApiError(400, "details are missing"));
  }

  let product = await Product.findOneAndUpdate(
    { _id: productid, "reviews.user": req.user.id },
    {
      $set: {
        "reviews.$.rating": rating,
        "reviews.$.comment": comment,
      },
    },
    { new: true }
  );

  if (!product) {
    product = await Product.findByIdAndUpdate(
      productid,
      {
        $push: {
          reviews: {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment,
          },
        },
      },
      { new: true }
    );
  }

  if (!product) {
    return next(new ApiError(400, "product not found"));
  }

  product.numOfReviews = product.reviews.length;

  let avgRating = 0;

  if (product.reviews.length > 0) {
    avgRating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;
  }

  product.ratings = avgRating;
  await product.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Review added successfully"));
});

// get all review
export const getAllreviews = asynchandler(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ApiError(400, "product id missing"));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError(400, "Product is not exist"));
  }

  return res.status(200).json(new ApiResponse(200, product.reviews));
});

//delete review

export const deleteReview = asynchandler(async (req, res, next) => {
  const { reviewid, productid } = req.query;

  if (!reviewid || !productid) {
    return next(new ApiError(400, "review and product id are missing"));
  }

  const product = await Product.findOneAndUpdate(
    { _id: productid, "reviews._id": reviewid },
    { $pull: { reviews: { _id: reviewid } } },
    { new: true }
  );

  if (!product) {
    return next(new ApiError(400, "product not found"));
  }

  const numOfReviews = product.reviews.length;
  let ratings;

  ratings =
    numOfReviews > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        numOfReviews
      : 0;

  product.numOfReviews = numOfReviews;
  product.ratings = ratings;

  await product.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, 4, "product review deleted successfully"));
});
