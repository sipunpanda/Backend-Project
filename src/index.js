// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:'./env'
})



//connect to db
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, ( => {
        console.log(`Server running on port ${process.env.PORT}`);  //process.env.PORT is environment variable set in .env file. It will return port number if set or 8000 if not set.
    }))
})
.catch((err) => {
    console.log("mongo db connection failed: ", err);
    
})