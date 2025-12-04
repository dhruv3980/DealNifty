import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    // Make sure folder exists
    const uploadPath = path.join("Images", "register");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // -> Images/register
  },


  filename: (req, file, cb) => {
    const name = `$Date.now()-$`;

    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
export default upload;
