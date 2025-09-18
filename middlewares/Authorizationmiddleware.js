import User from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "./asyncHandlermiddleware.js";
import jwt from "jsonwebtoken";

export const Authorization = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;



  if (!token) {
    return next(new ApiError(401, "Unauthorized Access"));
  }

  const verifyToken = jwt.verify(token, process.env.JwtSecret);

  const user = await User.findById(verifyToken?.id);


  if (!user) {
    return next(new ApiError(401, "invalid token"));
  }

  req.user = user;

  next();
});

// higher order function
export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role-${req.user.role} is not allowed to access the resource`
        )
      );
    }
    next();
  };
};
