import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from 'express-async-handler'


export const protect = asyncHandler( async(req, res, next) => {

   let token
//    console.log(req)
   if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
try {
    token = req.headers.authorization.split(" ")[1]
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = await User.findById(decoded.id).select("-password")
    console.log(req.user)
    next()
} catch (error) {
    console.error(error.message)
    res.status(401).json({errors: [{msg: "Not authorized, token failed"}]})
}
   
   }
   if(!token) {
    res.status(401).json({errors: [{msg: "Not authorized, no token"}]})
   }
 
})