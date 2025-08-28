class ApiError extends Error{
    constructor(statusCode, message, errors=[], stack=""){
        super(message)
        this.statusCode=statusCode;
        this.errors=errors;
        this.success=false;
        console.log(errors)

        if(stack){
            this.stack = stack;

        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}