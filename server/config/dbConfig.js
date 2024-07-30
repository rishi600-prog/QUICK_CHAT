import mongoose from "mongoose";


mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on("connected", function(){
            console.log("MongoDB connection successful");
})

db.on("error", function(){
            console.log("MongoDB connection failed");
})

export default db;