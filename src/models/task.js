const bcrypt =require ('bcryptjs')
mongoose =require('mongoose')

const taskSchema=new mongoose.Schema({
    description:{
        type: String,
        required:true,
        trim:true
    },
    completed:{
        type: Boolean,
        default:false //default is false so if no value was provided, it becomes false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, //type of mongoose ID
        required:true,
        ref:'User' //reference to User Model and this helps in relating both models
    }
},
{
    timestamps:true //Adding Createdat and Updatedat timestamps to Task
})

// taskschema.pre('save',async function(next){

// })
const Task=mongoose.model('Task',taskSchema)

module.exports=Task