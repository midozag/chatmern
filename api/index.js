import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import cors from 'cors'

import userRoute from './routes/userRoute.js'

// Initialize express app
const app = express()
const server = http.createServer(app)
const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods:["GET","POST"],
    credentials:true
  }
})

app.use(cors())
io.on('connection',(socket)=>{
  console.log('User connected:',socket.id)
  socket.on('join-conversation',(conversationId)=>{
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });
  socket.on('send-message',(messageData) =>{
    socket.to(messageData.conversation_id).emit('receive-message',messageData)
  })
  socket.on('disconnect',()=>{
    console.log('User disconnected');
  })
})
// Load environment variables
dotenv.config()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI)
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
      console.error(`Error: ${error.message}`)
      process.exit(1)
    }
  }
  const PORT = 3002
  const startServer = async () => {
    try {
      await connectDB()
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
      })
    } catch (error) {
      console.error(`Error starting server: ${error.message}`)
      process.exit(1)
    }
  }
  startServer()

app.use('/api/users',userRoute);
app.set('io', io);
