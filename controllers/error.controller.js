const AppError = require("../utils/AppError");

const globalHandler = (err, req, res, next) => {
    let error = {
        ...err
    }

    error.message = err.message;
    console.log(err)


    if(err.name === "CastError"){
        const message = `Resource not found`
        error = new AppError(message, 500)
    }

    if(err.code === 11000){
        const message = "Duplicate field value entered";
        error = new AppError(message, 500)
    }

    if(err.code === "ValidationError"){
        const message = Object.values(err.errors).map((val)=> val.message);
        error = new AppError(message, 500)
    }

    return res.status(stausCode || 5000).json({
        status: false,
        message: error.message || "status Error"
    })
}


module.exports = globalHandler;