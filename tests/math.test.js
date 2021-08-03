//.test in the file name makes sure that jest knows that there is test cases here

const {calculateTip,fahrenheitToCelsius,celsiusToFahrenheit,add}=require('../src/math')

    
test('Should calculate total with tip',()=>{
        const total=calculateTip(10,0.30)
        expect(total).toBe(13)
})

test('Should calculate total with default tip',()=>{
        const total=calculateTip(10)
        expect(total).toBe(12.5)
})

test('Should convert 32F to 0C',()=>{
    ConvertedTemp=fahrenheitToCelsius(32);
    expect(ConvertedTemp).toBe(0)
})

test('Should convert 0F to 32C',()=>{
    ConvertedTemp=celsiusToFahrenheit(0);
    expect(ConvertedTemp).toBe(32)
})

//3 ways to test asynchronous functions
//First Method(Least common method):
// test('ASync test demo',(done)=>{
//     setTimeout(()=>{
//         expect(1).toBe(2)
//         done()
//     },2000)  
// })

//Second Method:
// test('Should add 2 numbers',(done)=>{
//     add(2,3).then((sum)=>{
//         expect(sum).toBe(5)
//         done()
//     })
// })

//Third Method(Best Method):
test('Should add 2 numbers async/await',async()=>{
    const sum =await add(10,22)
    expect(sum).toBe(32)
})
// test('Hello World',()=>{ //1st arg is name of testcase, 2nd arg is the function that contains the code to verify what we're checking/testing

// })

// test('This should fail',()=>{
//     throw new Error('Failure!')
// })