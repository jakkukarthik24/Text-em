import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import pool from '../db/pool.js';
const router = express.Router();
router.get('/profile',protect,async (req,res)=>{
    const result= await pool.query('SELECT * FROM users WHERE id=$1',[req.user.id]);
    res.json({message:'This is a protected route',userId:req.user.id, user: result.rows[0]})
})
export default router;