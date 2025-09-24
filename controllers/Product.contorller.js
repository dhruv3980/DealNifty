import Product from "../models/Product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import asynchandler from "../middlewares/asyncHandlermiddleware.js";
import ApiFunctionality from "../utils/ApiFunctionality.js";
import { uploadOnCloudinaryproductimage } from "../utils/Cloudinary.js";
// 1 conntroller
import { cloudinary } from "../utils/Cloudinary.js";

export const createProduct = asynchandler(async (req, res, next) => {
  let image = [];
  image = req.files? req.files:[];

  // Upload all images in parallel
  const imagelinks = await Promise.all(
    image.map((img) => uploadOnCloudinaryproductimage(img.path))
  );

  req.body.user = req.user.id;
  req.body.images = imagelinks;

  const data = await Product.create(req.body);

  if (!data) {
    return next(new ApiError(401, "something wrong "));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "product create successfully"));
});

// 2 controller
export const deleteProduct = asynchandler(async (req, res, next) => {
  const id = req.params.id;

  const data = await Product.findByIdAndDelete(id, { new: true });

  if (!data) {
    return next(
      new ApiError(401, "something went wrong while delete the product")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Successfully delete the product"));
});

//3 controller
export const getAllProduct = asynchandler(async (req, res, next) => {
  const resultPerPage = 4;
  const apiFeature = new ApiFunctionality(Product.find(), req.query)
    .search()
    .filter();

  // getting filtered query before pagination
  const filteredQuery = apiFeature.query.clone();
  const productCount = await filteredQuery.countDocuments();

  // calculate totalapage
  const totalPages = Math.ceil(productCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new ApiError(404, "This page doesnot exist"));
  }

  apiFeature.pagination(resultPerPage);

  const data = await apiFeature.query;

  if (!data || data.length === 0) {
    return next(new ApiError(404, "no product found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data, productCount, totalPages, resultPerPage, currentPage: page },
        "All products"
      )
    );
});

// 4 conroller
export const getSingleProduct = asynchandler(async (req, res, next) => {
  const { id } = req.params;

  const data = await Product.findById(id);
  if (!data) {
    return next(new ApiError(404, "product not exist"));
  }
  return res.status(200).json(new ApiResponse(200, data, "Product found"));
});

// 5th controller

export const updatesingleproduct = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  let data = await Product.findById(id);
  if (!data) {
    return next(
      new ApiError(404, "Something went wrong while updating the products")
    );
  }


  let images = [];
  images = req.files? req.files:[];

  let imagelinks = [];

  if (images && images.length > 0) {
    for (let i = 0; i < data.images?.length; i++) {
      await cloudinary.uploader.destroy(data.images[i].public_id);
    }
    // upload new images
    imagelinks = await Promise.all(
      images.map(async (img) => {
        return await uploadOnCloudinaryproductimage(img.path);
      })
    );
  }

  req.body.images = imagelinks
  req.body.user=req.user.id;

  data = await Product.findByIdAndUpdate(id, req.body, { new: true });

  if (!data) {
    return next(
      new ApiError(404, "something went wrong while updating the product")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "product updated successfully"));
});

// adminproduct

export const getALLProduct = asynchandler(async (req, res, next) => {
  const product = await Product.find();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product fetched successfully"));
});
