import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const DB_URI = process.env.DB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI ? DB_URI : 'mongodb://localhost:27017/bifrost', {
      dbName: 'bifrost',
    })
    console.log("Db connected Successfully")
  } catch (err) {
    console.log(err)
  }
}

const db = mongoose.connection

db.on('connection',()=>{
    console.log("Database connected successfully")
})

db.on('error',()=>{
    console.log('Database connection failed\nServer not started')
})

db.on('disconnected',()=>{
    console.log('Database disconnected\nServer not started')
})

process.on('SIGINT',async ()=>{
    await db.close();
    process.exit(0);
})

export default connectDB;