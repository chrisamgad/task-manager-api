const request = require('supertest') //allows testing requests to the server as if it is actually running and listenting to port(while it is actually not running)
const jwt=require('jsonwebtoken')
const mongoose=require('mongoose')//to create Objectid
const app=require('../src/app.js')
const User = require('../src/models/user')

const userOneId= new mongoose.Types.ObjectId()
const userOne={
    _id:userOneId,
    name:'Mike',
    email:'mike@example.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({_id:userOneId}, process.env.JWT_SECRET)
    }]
}


// Applies to all tests in this file BEFORE each test
beforeEach(async()=>{
    await User.deleteMany() //deletes all users (as in case there are duplicates 3shan tebda2 3ala nadafa)
    await new User(userOne).save() //create a new user for testing 
    
})

test('Should 5==5',()=>{
    expect(5).toBe(5)
})
test('Should signup a new user', async()=>{
    const response= await request(app).post('/users').send({
        name:'Chris Amgad',
        email:'chrisamgad3@example.com',
        password:'MyPassa123!'
    }).expect(200)

    //assert that the database was changed correctly
    const user= await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({ //toMatchObject checks if an object contains a subset of properties
       user:{
           name:'Chris Amgad',
           email:'chrisamgad3@example.com'
       },
       token:user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPassa123!') //because it should be hashed
})

test('Should login existing user',async()=>{
    const response=await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    const UserFetched=await User.findById(userOne._id)//fetch user from DB
    //console.log(response.body.token)
    expect(response.body.token).toBe(UserFetched.tokens[1].token)
})

test('Should not login in non-existent user',async()=>{
    await request(app).post('/users/login').send({
        email:'nonexisting@test.com',
        password:'non-existent'
    }).expect(400)
})

test('Should get profile for user',async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) //sets header with an already created token that we manually created and added into the tokens array for testing
        .send()
        .expect(200)
})

test('Should not get profile for an unauthenticated user', async()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete account for user', async()=>{//sets header with an already created token that we manually created and added into the tokens array for testing
    await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    expect(await User.findById(userOne._id)).toBeNull() //expect when we fetch the user now to be null(since its deleted)
    
})


test('should not delete account for unauthenticated user', async()=>{//we dont set authorization in the header as we want to test if an unathenticated user tried to access this api
    await request(app)
        .delete('/users/me')
        .expect(401)
})

//test el upload bayez
// test('Should upload avatar image',async ()=>{
//     await request(app)
//         .post('/users/me/avatar')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .attach('avatar', 'tests/fixures/philly.jpg') //1st arg is the field we're setting in database and 2nd arg is directory of image from root
//         .expect(200)
// })