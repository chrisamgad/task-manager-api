const express=require('express')
const router=express.Router()
const multer = require('multer') //for uploading images
const sharp =require('sharp')
const User=require ('../models/user')

const auth = require('../middleware/auth.js')
const {sendWelcomeEmail,sendCancellationEmail} = require('../emails/account.js')


router.post('/users/login', async (req,res)=>{ //To login (POST is preferred for security as in GET, the login credentials will be available in URL)
    try{
        //findByCredentials is a function we created in the User model
        const user=await User.findByCredentials(req.body.email,req.body.password)
        
        const token=  await user.GenerateAuthToken() //once logged in, generate a new token to stay logged in
        res.send({user, token}) //sends back an object having the user and token
    }catch(error){
        console.log(error)
        res.status(400).send({Error:"Failed to Login"})
    }
})

router.post('/users/logout', auth, async(req,res)=>{ //auth is here because the user needs to be authenticated in order to log out

    try{
        //Removes the current token from the array of tokens(array of currently logged in sessions)
        req.user.tokens= req.user.tokens.filter((token)=>{
            return token.token !== req.token //if token not equal the current token, return it
        })
        await req.user.save() //save
        res.send()
        
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll',auth, async(req,res)=>{ //logouts a user from all devices
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send('Logged Out All devices ')
    }catch(e)
    {   console.log(e)
        res.status(500).send(e)
    }
})

router.post('/users',async(req,res)=>{ //creates new user (Signing Up)
    const user=new User(req.body)
    
    try{ //badal .then()
        await user.save();
        sendWelcomeEmail(user.email, user.name)
        const token =await user.GenerateAuthToken()
        res.send({user,token});
        console.log('Success')
    } catch(e){
        console.log(e)
        res.status(400).send(e);//sends the status code with the response and 400 represents a client error and also sends error as response
    }
    
})

router.get('/users/me', auth, async (req,res)=>{ //we pass the authentication function as 2nd arg

        res.send(req.user) //req.user is assigned in the auth function in case the user was authorized successfully
      
})

//THIS IS NOT SAFE, A BETTER APPROACH IS DONE IN /users/me
// router.get('/users/:id',async(req,res)=>{ //:id is a dynamic id and it's included in req.params
//     //console.log(req.params) 
//     const _id =req.params.id;
 
//     try{
//          const user=await User.findById(_id);
//          if(!user)
//              return res.status(404).send(); //user was not found (bas msh shaghala msh 3aref leh(bytala3 error 500))
  
//          res.send(user);
         
//     }catch(e){
//          res.status(500).send(e) //internal server error
//     }
//  })
 


const upload=multer({
   // dest: 'avatars', //destination of where to store the files that are getting uploaded
   //if dest is commented, the data is going to be passed to the route function instead of the file system 
   limits:{
        fileSize:1000000 //max file size 1Mb = 1*10^6
    },
    fileFilter(req,file,cb){ //function that gets executed to check for file extension
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) //if file extension is not jpg or jpeg or png
            return cb(new Error('Please upload only jpg or jpeg or png'))  //return error using the callback
        
        cb(undefined,true) //if we reached this line, upload the file successfully
    //Note: 3 ways to use callback
    //     cb(new Error('File must be a pdf')) //Rejects file AND send back an error to person uploading file via callback
    //     cb(undefined,true)//first arg undefined because no error, and 2nd arg is true bec upload is expected
    //     cb(undefined,false)//Rejects file but doesnt send error back
    }
})
router.post('/users/me/avatar',auth, upload.single('upload'), async (req,res)=>{
   
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer() //pass to sharp the file,then resize with preference then .png() coverts image to png 
   
    req.user.avatar=buffer //req.file.buffer contains the binary data of time file              //then we do toBuffer() to change the binary back to buffer
    //console.log(req.file)
    await req.user.save()
    res.send()
},(error,req,res,next)=>{ //This allows us to handle express error and send back error in JSON
    res.status(400).send({error: error.message}) //error.message is a message that holds the error that occured throughout the route handling
    })

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar= undefined //set avatar to undefined to delete photo
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user =await User.findById(req.params.id) //find user by id provided

        if(!user || !user.avatar) // if no user or his avatar found, produce an error
            throw new Error()
                                            //Normally, by default Express is smart enough to implicity set the header in every route handing we've made to return JSON to API as content-type in response
                                            //If we would do it explicitly, we do it by the following code line -->  res.set('Content-Type','application/json')
        res.set('Content-Type','image/png') //sets the Content-type header in the response as image/jpg 
        res.send(user.avatar) //send the avatar
    }catch(e){
        res.status(404).send()
    }
})

router.get('/usersAdmin', async(req,res)=>{
    try{
        Users= await User.find({})
        if(!Users)
            return res.status(404).send()

        res.send(Users)
    }catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})


 
router.delete('/users/me',auth, async (req,res)=>{
 
    try{
        // const user= await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }

        await req.user.remove() //better way of removing user than above method
        sendCancellationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(error){
        res.status(500).send(error)
    }
})

 router.patch('/users/me',auth, async(req,res)=>{ //For Updating
     
     const updates = Object.keys(req.body)//keys return an array of strings, where each index holds a type of the object (changes an object to array having the keys of objects)
     const allowedUpdates =['name','email','password','age']
     const isValidOperation=updates.every((update)=>{ //checks if the request holds a key that is actually found in the allowedupdates array(types found in the collection)
         return allowedUpdates.includes(update) //once a false is returned from the everyfunction, the loop stops
     })
     
     if(!isValidOperation)
         return res.status(400).send({error: 'Invalid Update'})
    // const _id =req.user._id; 
    
     try{
        const user=req.user //req.user was saved from auth middleware
        updates.forEach((update)=>{
            user[update] =req.body[update]
        })

        await user.save()
        //const user=await User.findByIdAndUpdate(_id,req.body,{new:true, runValidators:true})//1st argument is id youre looking for, 2nd arg is the req.body which will include your updates you will do, 3rd arg is an options object that we configure
        // if(!user) //if no user found
        //     return res.status(404).send()
 
         res.send(user)
     }catch(e){
         res.status(500).send(e)
     }
 })


module.exports = router