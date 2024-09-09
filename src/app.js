import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "18kb"})) //limit form bhar ne par ye data lega
app.use(express.urlencoded({extended:true, limit:"16kb"})) //extended ka matlab hum object ke andar object desakte hai
app.use(express.static("public")) //"public": is folder name: if we wants to store any file, photo then we can create an public folder as assets so anyone can acces thaat folder 
app.use(cookieParser()) //cookieparser is used to server ki browser ki cookie access kar pau aur kuch store kar pau jis se ki crud operation kar sakta hai
 

//routes immport
import userRouter from './routes/user.routes.js'
// import {router} from './routes/user.routes.js'

import healthcheck from "./controllers/healthcheck.controller.js"


//routes declaration
app.use('/api/v1/users', userRouter) //api is a prefix for all routes of userRouter

app.use('api/v1/healthcheck', healthcheck)

export default app


// http://localhost:8000/api/v1/users/register