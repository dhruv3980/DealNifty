import { Db_Name } from "../constants.js";
import mongoose from "mongoose";

export const connecttodb =  () => {
   return mongoose.connect(`${process.env.Mongodb_Url}/${Db_Name}`)
    
};


