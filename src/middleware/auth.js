const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = async (req,res,next)=>{
    try{
        const token =req.header('Authorization').replace('Bearer ', '') //replace Bearer  with nothing to extract the token
        const decoded= jwt.verify(token,process.env.JWT_SECRET) //decode the token if decoded successfully using the 2nd arg(secret key)
        const user=await User.findOne({_id:decoded._id, 'tokens.token': token}) //1st find the user with the correct ID
                //2nd arg basically means that we are searching for a token in tokens array that has the token that was generated for every user
                //In other words, it checks that the token is still stored in the tokens array so that he still gains access once he goes to webapge
        if(!user)
            throw new Error()
        
        //By reaching this point, there is no error thrown so we do 2 things
            //1. set a user property in request such that it can be accessed by other route handlers
            //2. add the next() as to continue with the route handling functions
        req.token = token
        req.user =user //Set a user property in request to the user that we just fetched
        next() //if No Error

    }catch(e){
        res.status(401).send({error:'Please authenticate!!'})
    }
} 

module.exports=auth