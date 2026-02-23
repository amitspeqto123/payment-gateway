const mongoose = require("mongoose");


const paymentDatabase = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected Successfully..")
    }catch(error){
        console.log("Database connection failded..", error);
    }
}

module.exports = paymentDatabase;