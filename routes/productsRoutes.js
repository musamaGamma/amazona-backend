import express from "express";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import { protect} from "../middlewares/auth.js";
import { check, validationResult } from 'express-validator'
const router = express.Router();

//@desc fetch all products
//@route GET /api/products
//@access public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    
    const pageSize = 5
    const page = +req.query.pageNumber || 1
    console.log(Boolean(req.query.keyword))
    const keyword = req.query.keyword ? {
      name: {
        $regex: req.query.keyword,
        $options: "i"
      }
    } : {}
    const category = req.query.category? {category: req.query.category }: {}
    console.log(keyword)
     const count = await Product.countDocuments({...keyword})
     console.log(req.query)
    const products = await Product.find({...keyword,...category}).populate("category", "name").limit(pageSize).skip(pageSize * (page -1))

    res.json({products, page, pages: Math.ceil(count / pageSize)});
  })
);

//get user products
router.get("/me", protect, asyncHandler(async (req, res)=> {
   console.log("are you reaching me")
  const products = await Product.find({user: req.user._id.toString()}).populate("category", "name")
  res.json(products)
}))
//get product
//GET /api/products/:id

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const product = await Product.findById(req.params.id);
      if (product) res.status(200).json(product);
      else {
        res.status(404).json({errors: [{msg: "Product not found"}]})
      }
    })
  );

  // create a proudct
// POST api/products

router.post(
    "/",
    protect,[
      check("name", "Name field is required").not().isEmpty(),
      check("brand", "Brand field is required").not().isEmpty(),
      check("description", "Description field is required").not().isEmpty(),
      check("image", "Image field is required").not().isEmpty(),
      check("category", "Category field is required").not().isEmpty(),
     
    ], asyncHandler(
   async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
      }
        
          const {
            name,
            image,
            price,
            brand,
            category,
            countInStock,
            description,
          } = req.body;
          
      const product = new Product({
        name,
        price,
        user: req.user._id,
        image,
        brand,
        category,
        countInStock,
        description,
      });
      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
      
     
    })
  );

//add a review
//POST /api/products/:id/reviews
router.put(
  "/:id/reviews",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
       return  res.status(400).json({errors: [{msg: "Already reviewd"}]})
      }
      //create a review object
      const review = {
        name: req.user.name,
        rating: +rating,
        comment,
        user: req.user._id,
      };
      //push the object to the review array
      product.reviews.push(review);
      //update the number of reviews
      product.numReviews = product.reviews.length;
      //calculate the average rating
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.numReviews;

      //save the changes
      await product.save();
      res.status(201).json({ msg: "review added" });
    } else {
      res.status(404);
      res.status(404).json({errors: [{msg: "Product not found"}]})
    }
  })
);


router.put("/:id", asyncHandler(async (req, res)=> {
  const {countInStock, name, price, image, description, category} = req.body
  const product = await Product.findById(req.params.id)
  product.countInStock = countInStock
  // product.name = name
  // product.price = price
  // product.image = image
  // product.description = description
  // product.category = category
  const updated = await product.save()
  res.json(updated)

}))



router.delete("/:id/reviews",protect, asyncHandler(async (req, res)=> {
  const product = await Product.findById(req.params.id);
  console.log(req.user._id)
const index =  product.reviews.findIndex(x => {
  console.log(x.user.toString()) 
  === req.user._id.toString()})
console.log(index)
// product.reviews.splice(index, 1)
await product.save()
res.json("review deleted")
}))
  //delete all
router.delete("/deleteAll", asyncHandler(async (req, res)=> {
  await Product.deleteMany({})
  res.send("deleted succesfuly")

}))

  export default router