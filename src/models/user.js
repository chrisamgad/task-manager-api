const mongoose=require('mongoose')
const validator = require('validator')
const bcrypt =require ('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require ('./task.js')
//create new instance of schema and insert the model declarations inside such that we are able to apply middleware functions in this schema

const userSchema=new mongoose.Schema({ //mongoose takes the name of the model(1st arg), and makes the name of the collection users  
    name:{
        type: String,//validates that name must be string,
        required: true,
        trim:true
    },
    age:{
        type: Number //validates that age must be a number

    },
    email:{
        type:String,
        required: true,
        unique:true, //ensures no duplicates()
        trim: true, //removes white spaces
        lowercase: true,//changes upper case into lower case
        validate(value){
            if(!validator.isEmail(value)) //validator.isEmail(value)==false
                throw new Error ('Email is invalid')
        }
    },

    password:{
        type:String,
        required:false,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('Password cant include password')         
        }

        
    },

    tokens:[{ //tokens is an array of objects, each object contains a token
       token:{
           type:String,
           required:true
       } 
    }],
    avatar: {
        type: Buffer //allows storing binary data, which helps us in storing images
    }
},
//2nd arg is an object that contains options, where one of the options is timestamps
{   //to enable the use of virtual, set virtuals to true in toObject and toJSON as done below
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    timestamps:true //Adding Createdat and Updatedat timestamps to User
    

})

userSchema.virtual('tasks',{ //virtual is NOT stored in DB but it's just a way for mongo to figure out who owns what and how they're related
    ref: 'Task',
    localField: '_id', //the local field is where the local data is stored so the ownerId in the task is associated with the id of the user here in the User Model
    foreignField: 'owner' // the name of the field on the other model(Task) that has this User ID, which is owner that is in the Task model
})


//Differance between .methods and .statics is that
// .methods--> You are accessing a specific instance of the schema like this.user
//.statics --> the function is  a static "class" method to the Model itself (more of a class function rather than an object of the class function)
userSchema.methods.GenerateAuthToken =async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET) //this function generates the new token

    user.tokens=user.tokens.concat({token:token}) //adds new token object to the instance user's tokens arary
    await user.save() //call this such that we update yser ,where the new token that was added to the user tokens array for this user
    return token
}

userSchema.methods.toJSON =  function(){ //video 11 in Authentication (This removes password and tokens fields from user)
    const user=this;
    newUserObject=user.toObject()

    delete newUserObject.password//for security
    delete newUserObject.tokens//for security
    delete newUserObject.avatar //for performance
    return newUserObject
}
//findByCredential function that checks if password and email matches anyone of the records in the DB
// and returns this user if found successfuly
userSchema.statics.findByCredentials = async (email,password)=>{ //create a function findByCredentials for the model User
    const user= await User.findOne({email:email}) //finds a user with the email recceived in this parameter
    if(!user) //if no user found
        throw new Error ('Unable to login')
    
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) //if email or password dont match ones in DB
        throw new Error ('Unable to login')
 
    return user
}


//Hash the plain text before saving
//we need this as we need to hash password before creating a new user or updating a previous user's password
userSchema.pre('save',async function(next){ //first arg is the function name you want to perform something pre it, 2nd arg is the function you want to perform
    const user=this;

    console.log('Just before saving')
    if(user.isModified('password')){ //if password was modified
        user.password = await bcrypt.hash(user.password,8) //overwrite plain password with hashed pass
    }
    next() //call next when done
            //if we didn't call next, it will hang here and the user will never be saved
})

//Delete user tasks when user is removed
userSchema.pre('remove',async function(next){ //since remove is user in the delete user api /users.ne
    const user=this
    await Task.deleteMany({owner:user._id}) //delete all tasks that have the owner of this user id
    next()
})


//1st arg is name of your model
const User=mongoose.model('User',userSchema)

module.exports = User;