const Task=require('../models/task.js')
const auth = require('../middleware/auth') //middleware
const express=require('express')
const router= express.Router()

router.post('/tasks' ,auth, async(req,res)=>{ //creates new task
    //the task created is associated to the person authenticated who creates it
    //const task= new Task(req.body); //creates a new task object from mongoose model and req.body contains the task details you want to create
    const task= new Task({
        ...req.body, //copy all properties from req.body into here
        owner: req.user._id //each task has an owner id()
    })

    try{
        await task.save()
        res.status(200).send(task)

    }catch(e){
        res.status(400).send(e)
    }

})

//GET /tasks?completed=false -->returns back tasks with false completed
//Get /tasks?limit=10&skip=0
router.get('/tasks',auth,async (req,res)=>{

    const match={} //initially ={} as in case no filter is wanted by user
    const sort={} //initially ={} as in case no sorting is wanted by user

    //Filtering handling Code if query string includes Filtering
    if(req.query.completed==='true') //if the API /tasks?completed=true
        match.completed=true
    else if(req.query.completed==='false')//if the API /tasks?completed=false
        match.completed=false

    //Sorting handling Code if query string includes sorting
    if(req.query.sortBy) //if sortBy was found in query string
    {
        const parts= req.query.sortBy.split('_') //splits createdAt_desc into an array, with first index,parts[0], is createdAt and second index,parts[1] is desc
        if(parts[1]=='asc')
            sort[parts[0]]= 1 //sort['createdAt']=1 (this is one way of accessing object in case you dont know and in case it didn't find createdAt in object, it creates a new key with its name)
        else if (parts[1]=='desc')
            sort[parts[0]]= -1
    }
    try{
        
        await req.user.populate({
            path: 'tasks',
            match:match, //match is an option used for filtering in populate and it is an object that includes keys and values to filter
            options:{
                limit:parseInt(req.query.limit), //parseInt converts the parameter (query string here) to Int
                skip:parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate() //This also works as the above commented line
        res.send(req.user.tasks);
    }catch(error){
        res.status(500).send(error) //500 is server internal error
    }   
})

router.get('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id

    try{
        //const task= await Task.findById(_id) //THIS IS VERY Dangerous and replaced by the below line code
        const task= await Task.findOne({_id:_id, owner:req.user._id}) //This is very important replacement than the above commented line
                                                                    //because this prevents a user logged in from fetching a task of another user
                                                                    //ID OF TASK MUST MATCH (to find the task) && OWNER OF THIS TASK MUST ALSO MATCH (to prevent hacker from accessing someone's task)
                                                                    /*So that in case another User Mathew got hands on a task ID of Chris, Mathew still cant access Chris's task because ID owner of Task is of Chris not Mathew's, 
                                                         as the current req.user._id is Mathew(while Mathew is trying to access /tasks/TaskID, he's authenticated but with his own req.user, which includes info of Mathew) */
        if(!task)        
            return res.status(404).send()
        
        res.send(task)

    }catch(error){
        console.log(error)
        res.status(500).send(error)
    }
})



router.patch('/tasks/:id' ,auth, async(req,res)=>{
    const updates = Object.keys(req.body)//keys return an array of strings, where each index holds a type of the object (changes an object to array having the keys of objects)
    const allowedUpdates =['description','completed']
    const isValidOperation=updates.every((update)=>{ //checks if the request holds a key that is actually found in the allowedupdates array(types found in the collection)
        return allowedUpdates.includes(update) //once a false is returned from the everyfunction, the loop stops
    })
    if(!isValidOperation)
        return res.status(400).send({error:'Invalid update'})
    
    try{
        //const task=await Task.findById(req.params.id)
        const task=await Task.findOne({_id:req.params.id, owner:req.user._id})
        
        if(!task)
            return res.status(404).send()

        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
        await task.save()
        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})//1st argument is id youre looking for, 2nd arg is the req.body which will include your updates you will do, 3rd arg is an options object that we configure
      
        res.send(task)    
    }catch(error){
        console.log(error)
    }
})


router.delete('/tasks/:id',auth, async(req,res)=>{
    
    try{
        //const task=await Task.findByIdAndDelete(req.params.id)
        const task= await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
      
        res.status(500).send(e)
    }
})

module.exports =router;