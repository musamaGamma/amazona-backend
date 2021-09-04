import express from "express"
import connectDb from "./config/db.js"
// import dotenv from "dotenv"
import userRoutes from "./routes/usersRoute.js"
import productRoutes from "./routes/productsRoutes.js"
import categoriesRoutes from "./routes/categoriesRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import {errorHandler} from "./middlewares/error.js"
import cors from "cors"
import path from "path"
// import morgan from "morgan"
// dotenv.config()
const app  = express()

//connect to database
connectDb()

app.use(cors("*"))
app.use(express.json())


// app.use(morgan("dev"))
app.use("/api/users/",userRoutes )
app.use("/api/products/", productRoutes)
app.use("/api/categories/", categoriesRoutes)
app.use("/api/orders/",orderRoutes )
app.use("/api/upload/",uploadRoutes )

const __dirname = path.resolve()
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))
app.get("/", (req, res)=> {
    res.send("hello api")
})
app.use(errorHandler)

const port = process.env.PORT || 5000
app.listen(port, ()=> console.log(`server is running on port ${port}`))