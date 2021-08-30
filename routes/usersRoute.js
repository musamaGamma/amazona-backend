import { Router } from 'express'
import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"
import { check, validationResult } from 'express-validator'
import { protect } from '../middlewares/auth.js'
const router = Router()


//@route /api/users/login
//login user

router.post("/login",[
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Password is required"
    ).exists()
  ], asyncHandler(async(req, res)=> {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
     
    }
    const { email, password} = req.body
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid credentials" }] });
    }

    // check if the entered password matches the one in the database
    const isMatch = await user.matchPassword(password)
    if(!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid credentials" }] });
    }
    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
    })
}))


//@route /api/users/register
//register user
router.post("/register",[
    check("name", "Name field is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ], asyncHandler(async(req, res)=> {
    console.log("we made it")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
      }
      
      const {name, email, password} = req.body
      const user = await User.findOne({email})
      if(user) { return res.status(400).json({errors: [{msg: "User is already registerd"}]})}
      const newuser =   await User.create({name, email, password})
      if(newuser) res.status(201).json({ _id: newuser._id,
        name: newuser.name,
        email: newuser.email,
        isAdmin: newuser.isAdmin,
        token: generateToken(newuser._id),})
}))

router.get("/",protect, asyncHandler(async(req, res)=> {
    const users = await User.find({})
    res.json(users)
    
}))

export default router