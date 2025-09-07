import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import pool from '../db/pool.js';
const router=express.Router();
router.get('/conversations',protect,async (req,res)=>{
    const userId=req.user.id;
    try{
        const response=await pool.query(
            `
            SELECT 
            c.*,u.username AS other_username
             from conversations c
             JOIN users u ON
             (CASE
                WHEN c.user1_id=$1 THEN c.user2_id=u.id
                WHEN c.user2_id=$1 THEN c.user1_id=u.id
             END)
             where $1 IN(c.user1_id,c.user2_id)
             ORDER BY c.last_message_time DESC
            `
            ,[userId]
        )
        res.json(response.rows)
    }
    catch(err){
        res.status(500).json({message:'Error fetching conversations'})
    }
})
router.get('/messages/:conversationId',protect,async (req,res)=>{
    const {conversationId}=req.params;
    const userId=req.user.id;
    try{
        const response=await pool.query(`
            SELECT
                m.id,
                m.content,
                m.sender_id,
                m.created_at,
                u.username AS sender_username
            FROM messages m
            JOIN users u ON m.sender_id=u.id
            WHERE m.conversation_id=$1
            ORDER BY m.created_at ASC
        `,[conversationId])
        const messages=response.rows.map(msg=>({
            ...msg,
            isSentByMe:msg.sender_id===userId
        }))
        res.json(messages);
    }
    catch(err){
        res.status(500).json({message:'Error fetching messages'})
    }
})
router.post('/messages',protect,async (req,res)=>{
    const {conversationId,content}=req.body;
    const userId=req.user.id;
    try{
        const response=await pool.query(
            'INSERT INTO messages (conversation_id,sender_id,content) VALUES ($1,$2,$3) RETURNING *',
            [conversationId,userId,content]
        )
        await pool.query(`UPDATE conversations SET last_message=$1,last_message_time=NOW(),last_sender_id=$2 WHERE id=$3`,
             [content,userId, conversationId]);
        
        res.json(response.rows[0])
    }
    catch(err){
        res.status(500).json({message:'Error sending message'})
    }
})
export default router;