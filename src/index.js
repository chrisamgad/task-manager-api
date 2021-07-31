const express=require('express')
require('./db/mongoose.js') // we dont grab something from there because we need only mongoose to conncet to database
//const User=require('./models/user')
//const Task=require ('./models/task')

const userRouter = require ('./routers/user.js')
const taskRouter = require('./routers/task.js')

const app=express()
const port = process.env.PORT


// app.use((req,res,next)=>{ //how to use middleware
//     if(req.method === 'GET')
//         res.send('GET requests are disabled') //send a response that GET requests are disabled.. Note: next() is not called so it will just do this and no route handling will take place
//     else
//         next() //Go to next step, which is the the route path handler (ele7na 3amalnah abl keda )
// })


app.use(express.json()) //this line automatically parses any incoming JSON to server into javascript Object so we are able to access these incoming messages such a request to server
app.use(userRouter) //to use the router (userRouter is express.Router() but we imported it from another file)
app.use(taskRouter)

 

app.listen(port,()=>{
    console.log('Server is running on port '+port)
})

const Task= require('./models/task.js')
const User= require ('./models/user.js')

// const main = async ()=>{
//     const task= await Task.findById('60ff2a1422ba9e3598bf2aff')
//     await task.populate('owner').execPopulate()
//     console.log(task)

// }

const main = async () =>{
    const task = await Task.findById('61008e33b5072a20b079d9d3')
    await task.populate('owner').execPopulate()
    console.log(task)

    // const user= await User.findById('610086d8356a1f26bcda5076')
    // await user.populate('tasks').execPopulate() 
    // console.log(user)
    
}

main()