import express from "express";
import Category from "../models/Category.js";
import asyncHandler from "express-async-handler";
import { protect} from "../middlewares/auth.js";

const router = express.Router();

//get all categories
//@route GET /api/categories
router.get("/", asyncHandler(async (req, res)=> {
   const categories = await Category.find({})
   res.json(categories)
}))

//create category
//@route POST /api/categories
router.post("/",protect, asyncHandler(async (req, res)=> {
   
    const createdcategory = await Category.create({name: req.body.name})
    res.json(createdcategory)
}))

//get categories
//@route GET /api/categories
router.get("/", asyncHandler(async (req, res)=> {
  const categories = await Category.find({})
  res.json(categories)
}))

//delete all
router.delete("/deleteAll", asyncHandler(async (req, res)=> {
   await Category.deleteMany({})
   res.send("deleted succesfuly")

}))

  export default router