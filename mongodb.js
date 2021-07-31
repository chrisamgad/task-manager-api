//CRUD --> Create, Read, Update , Delete
// const mongodb =require('mongodb')
// const MongoClient = mongodb.MongoClient//gives us acccess to function necessary to connect to database
// const ObjectID= mongodb.ObjectID;

const {MongoClient,ObjectID} =require('mongodb')

const connectionURL='mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id= new ObjectID()
// console.log(id.id.length)
// console.log(id.toHexString().length)
// console.log(id.getTimestamp())

MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology: true}, (error,client)=>{ //3rd parameter is a function that gets called once we connect to database
    if(error)
        return console.log(error) //return is to stop function from executing
    
    //console.log('Connected correctly!')

    // const db=client.db(databaseName)
    
    // db.collection('users').deleteMany({
    //     age:27
    // }).then((results)=>{
    //     console.log(results)
    // }).catch((error)=>{
    //     console.log(error)
    // })


    const db=client.db(databaseName)
    
    db.collection('tasks').deleteOne({
        description:"task2"
    }).then((results)=>{
        console.log(results)
    }).catch((error)=>{
        console.log(error)
    })

    
    });


 