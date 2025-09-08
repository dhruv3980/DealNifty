// import User from "../models/User.models";
import { ApiResponse } from "./Apiresponse.js";

export const jwthelper = async function (
  user,
  res,
  req,
  message = "register user succssfully"
) {
  const generatejwttoken = await user.generatejwttoken();

  const options = {
    httpOnly:true,
    secure:false,
    sameSite: "lax",     
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  };

  res
    .cookie("token", generatejwttoken, options)
    .status(201)
    .json(new ApiResponse(201, { user, token: generatejwttoken }, message));
};
