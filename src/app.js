import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({limit: "18kb"}))






export default app