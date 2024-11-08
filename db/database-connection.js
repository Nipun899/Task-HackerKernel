const mongoose = require("mongoose")
async function callToDatabase(){
    try {
        const mongoURL= "mongodb://localhost:27017/HackerKernel"
        if(!mongoURL){
            throw new Error("MONGODB_URL environment variable not set"  
            )
        }
        await mongoose.connect(mongoURL)
        console.log("Connected to DB 🫶🫶")
    } catch (error) {
        console.log(error)
    }
}
module.exports = callToDatabase