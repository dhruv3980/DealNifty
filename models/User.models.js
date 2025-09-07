import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, "please enter the name"],
      maxlength: [25, "name should not be greater than 25 character"],
      minlength: [3, "name should not be less than equal to the 3 character"],
    },
    email: {
      type: String,
      required: [true, "please enter the email"],
      unique: [true, "email exist"],
      validate: [validator.isEmail, "Please enter the valid email"],
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minlength: [8, "password should be greater than 8 character"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // 1st - updating the user profile

  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.generatejwttoken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JwtSecret,
    { expiresIn: process.env.JwtExpiry }
  );
};

userSchema.methods.checkPasswordCorrect= async function(password){
  return  await bcrypt.compare(password, this.password);

}

userSchema.methods.generatePasswordResetToken = function () {
  try {
    // Generate plain reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to schema field
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Expiry time (30 minutes from now)
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    // Return plain token (to send via email)
    return resetToken;
    
  } catch (error) {
    throw new Error("Error generating reset password token");
  }
};


const User = mongoose.model("User", userSchema);
export default User;
