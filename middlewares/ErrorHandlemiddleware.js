import { ApiError } from "../utils/ApiError.js";

export default (err,req,res,next)=>{
    err.statusCode = err.statusCode||500;
    err.message=err.message||"internal server error";

    if(err.name==='CastError'){
        const message = `This is invalid resource ${err.path}`

        err = new ApiError(404, message)
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}