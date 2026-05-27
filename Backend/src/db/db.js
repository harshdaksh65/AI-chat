const mongoose = require('mongoose');


async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (err) {
        console.error("Error connecting to MongoDB:", err)
    }

}


module.exports = connectDb;