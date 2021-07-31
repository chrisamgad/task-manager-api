const mongoose=require('mongoose')


mongoose.connect(process.env.MONGODB_URL,
{ 
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true, //removes depreciation warning,
    useFindAndModify:false
    
})



//  const me= new User({
//      name:'Chris',
//      age:21,
//      email:'test@sad.com',
//      password:'sdordsa'
//  })

//  me.save().then((result)=>{
//      console.log(result)
//  }).catch((error)=>{
//      console.log(error)
//  })

