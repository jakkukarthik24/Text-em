import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export function protect(req,res,next){
    const headers=req.headers.authorization;
    if(!headers || !headers.startsWith('Bearer ')){
        return res.status(401).json({message:'Not authorized, No token'});
    }
    const token=headers.split(' ')[1];
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user={
            id:decoded.id,
            username:decoded.username,
            email:decoded.email
        }
        next();
    }
    catch(err){
        return res.status(401).json({message:'Not authorized, Token failed'});
    }
}