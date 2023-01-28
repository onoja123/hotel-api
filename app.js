const express = require('express');
const globalHandler = require("./controllers/error.controller")
const hotelRoute = require("./routes/hotel.route")
const roomRoute = require("./routes/room.route")
const userRoute = require("./routes/user.route")
const authRoute = require("./routes/auth.route")
const helmet = require("helmet")
const cors = require("cors")


const app = express();

app.use(helmet())


if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}


// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}))


app.use(express.urlencoded({extended: true}))


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/hotels", hotelRoute);
app.use("/api/rooms", roomRoute);

app.use(globalHandler)

app.use(cors())

app.get("/", (req, res)=>{
    res.send("Hotel server live ⚡️")
})

app.all("*", (req, res, next)=>{
    res.status(404).json({
     status: false,
     messsage: `${req.originalUrl} not found`
    })
 })
module.exports = app;