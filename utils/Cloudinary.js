import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloudinary_Cloud_Name,
  api_key: process.env.Cloudinary_Cloud_Api_Key,
  api_secret: process.env.Cloudinary_Cloud_Api_Secret,
});

export const uploadOnCloudinary = async (localfilename) => {
  try {
    if (!localfilename) return null;

    const absolutePath = path.resolve(localfilename).replace(/\\/g, "/"); // fixed variable

    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: "DealNifty",
      width: 150,
      crop: "scale",
    });

    if (fs.existsSync(localfilename)) {
      fs.unlinkSync(localfilename);
    }

   

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.log(error);

    if (fs.existsSync(localfilename)) {
      fs.unlinkSync(localfilename);
    }

    return null;
  }
};
