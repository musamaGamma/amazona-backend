import express from "express";
import Order from "../models/Order.js";
import asyncHandler from "express-async-handler";
import {protect} from "../middlewares/auth.js";
import Stripe from "stripe"
import { v4 as uuidv4 } from 'uuid'

import dotenv from "dotenv"
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET)
const router = express.Router();

//desc create new order
// POST /api/orders
//access private

router.post(
  "/",protect, 
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if(orderItems && orderItems.length === 0) {
     return res.status(400).json({errors: [{msg: "No order items"}]})
  }
  else {
      const order = new Order({
          user: req.user._id,
          orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
      })
  
      const createdOrder = await order.save()
      res.status(201).json(createdOrder)
  }
  
  })
);

router.get("/",protect, asyncHandler(async(req, res)=> {
  const orders = await Order.find({}).populate("user", "id, name")
  res.json(orders)
}))


router.get("/:id", protect, asyncHandler(async (req, res)=> {
  const order = await Order.findById(req.params.id).populate("user", "name")
  if(!order) return res.status(404).json({errors: [{msg: "order was not found"}]})
  res.json(order)
}))

//PAY ORDER
router.put("/:id/pay", protect, asyncHandler(async (req, res)=> {
  console.log('are going into here')
  const {token} = req.body
  const order = await Order.findById(req.params.id)
  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id
  })
  console.log({customer})
  const idempotencyKey = uuidv4()
  const charge = await stripe.charges.create({
    amount: order.totalPrice * 100,
    currency: "usd",
    customer: customer.id,
    receipt_email: token.email,
    description: `purchased the ${order.name}`,
    shipping: {
name: token.card.name,
address: {
  line1: token.card.address_line1,
  line2: token.card.address_line2,
  city: token.card.address_city,
  country: token.card.address_country,
  postal_code: token.card.address_zip

}
    },
  
 
  }, {idempotencyKey})
 console.log("charge", {charge})
  if(order) {
    order.isPaid = true
    order.paidAt = Date.now()
    
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  }
  else {
    res.status(404).json({errors: [{msg: "order not found"}]})
  }
}))


export default router