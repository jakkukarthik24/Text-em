import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'})
}
export const register=async (req,res)=>{
    const {username,email,password}=req.body;
    try{
        const response=await pool.query('SELECT * FROM users WHERE email=$1',[email]);
        if(response.rows.length>0){
            return res.status(400).json({message:"User alresdy exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=await pool.query('INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *',[username,email,hashedPassword]);
        const token=generateToken(newUser.rows[0].id);
        res.status(201).json({token,user: newUser.rows[0]});
    }
    catch(err){
        res.status(500).json({message:'Error registering user',error:err.message})
    }
}
export const login=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const response =await pool.query('SELECT * FROM users WHERE email=$1',[email]);
        if(response.rows.length==0){
            return res.status(404).json({message:"User not found"});
        }
        const user=response.rows[0];
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid credentials"});
        }
        const token=generateToken(user.id);
        return res.json({token,user:user});

    }
    catch(err){
        res.status(500).json({message:"Error logging in user",error:err.message});
    }
}