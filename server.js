const app = require("./app")

const mongoose = require("mongoose")

const dotenv = require("dotenv")


dotenv.config({path: "./config.env"})


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
  
  
const DB = process.env.DATABASE.replace(
    'password', 
    process.env.DATABASE_PASSWORD
)

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => {
    console.log('⚡️:: Connected to MongoDB!');
}).catch(err =>{
    console.log(err);
    process.exit(1);
})

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (req, res)=>{
    console.log(`⚡️:: Server running on port ${PORT}...`)
})

process.on("unhandledRejection", err =>{
    console.log("UNHANDLED REJECTION! ! 💥 Shutting down...")
    console.log(err.name, err.message);
    server.close(()=>{
        
        process.exit(1);
    })

})