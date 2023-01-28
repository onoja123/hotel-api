const AppError = require("../utils/AppError")

const globalHandler = (err, req, res, next)=>{
    let error = {
        ...err
    };

    error.message = err.message;
    console.log(err)


    if(err.name === "CastError"){
        const message = `Resource not found`;
        error = new AppError(message, 500)
    }

    if(err.code === 11000){
        const message = "   co";
        error = new AppError(message, 500)
    }

    if(err.code === "ValidationError"){
        const message =
        error = new AppError(message, 500)
    }

    return res.status(err.statusCode || 500).json({
        status: false,
        error: error.message || "server error"
    })
}

module.exports = globalHandler;