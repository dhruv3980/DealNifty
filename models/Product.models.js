import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the product name"],
  },

  description: {
    type: String,
    required: [true, "Please enter the product description"],
  },

  price: {
    type: Number,
    required: [true, "Please enter the price"],
    max: [9999999, "Price should not exceed 7 digits"],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [true, "Please enter the category"],
  },

  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    max: [9999, "Stock cannot exceed 9999"],
    default: 1,
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      // Optional: user: { type: mongoose.Schema.ObjectId, ref: "User", required: true }
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
