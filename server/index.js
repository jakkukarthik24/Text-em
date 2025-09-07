import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
//import pool from './db/pool.js';
import auth from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import chat from './routes/chatRoutes.js';
import {createServer} from 'http';
import {Server} from 'socket.io';
const app=express();
dotenv.config();
const port=process.env.PORT || 5000;

const server=new createServer(app);
const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});
app.use(cors());
app.use(express.json());

io.on("connection",(socket)=>{
    console.log(`User connected: ${socket.id}`);
    socket.on("join_conversation",(conversationId)=>{
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation ${conversationId}`)
    })
    socket.on("send_message",(data)=>{
        console.log("Message received: ",data);
        io.emit("receiveMessage",data);
    })
    socket.on("disconnect",()=>{
        console.log("User disconnected",socket.id);
    })
})

app.use('/auth', auth);
app.use('/api',protectedRoutes);
app.use('/chat',chat);
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});