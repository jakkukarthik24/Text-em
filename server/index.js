import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
//import pool from './db/pool.js';
import auth from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import chat from './routes/chatRoutes.js';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { on } from 'events';
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

let onlineUsers=new Map();

io.on("connection",(socket)=>{
    console.log(`User connected: ${socket.id}`);
    socket.on("user_connected",(userId)=>{
        onlineUsers.set(userId,socket.id);
        io.emit("update_online_users",Array.from(onlineUsers.keys()));
        console.log("Online Users: ",onlineUsers);
    })
    socket.on("join_conversation",(conversationId)=>{
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation ${conversationId}`)
    })
    socket.on("send_message",(data)=>{
        const {senderId,receiverId,conversationId,message}=data;

        console.log(`Message from ${senderId} to conversation ${conversationId}: ${message}`);
        const senderSocket=onlineUsers.get(senderId);
        const receiverSocket=onlineUsers.get(receiverId);
        if(senderSocket){
            io.to(senderSocket).emit("receive_message",data);
        }
        if(receiverSocket){
            io.to(receiverSocket).emit("receive_message",data);
            console.log(`Message delivered to user ${receiverId}`);
        }
        else{
            console.log(`User ${receiverId} is offline`);
        }
        
    })
    socket.on("typing",({senderId,receiverId,conversationId,isTyping})=>{
        const receiverSocket=onlineUsers.get(receiverId);
        if(receiverSocket){
            io.to(receiverSocket).emit("typing_indicator",{senderId,conversationId,isTyping});
        }
    });
    socket.on("disconnect",()=>{
        for(let [userId,sId] of onlineUsers.entries()){
            if(sId===socket.id){
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("update_online_users",Array.from(onlineUsers.keys()));
        console.log("User disconnected",socket.id);
    })
})

app.use('/auth', auth);
app.use('/api',protectedRoutes);
app.use('/chat',chat);
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});