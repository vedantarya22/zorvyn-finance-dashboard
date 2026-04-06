import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async(req,res)=>{
    try{
        const{name,email,password,role} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({success:false,message:"Name, email and password are required"});

        }

        const existing = await User.findOne({email});
        if(existing){
            return res.status(409).json({success:false,message:"Account already exists"});
        }


        //user registers as a viewer
        const assignedRole = process.env.NODE_ENV !== "production" &&  role ? role : "viewer"; //to allow setting roles in dev

        const user = await User.create({name,email,password,role: assignedRole});
        const token = signToken(user._id);

        res.status(201).json({success:true,token,user});
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};

export const login = async(req,res)=>{
    try{

        const {email,password} = req.body;
    
        if(!email || !password) {
            return res.status(400).json({success:false,message:"Email and password are required"})
        }
            const user = await User.findOne({ email }).select('+password');

        if(!user || !(await user.comparePassword(password))) {
            return res.status(401).json({success:false,message:"Invalid email or password "});
        }
    
        if(user.status === "inactive"){
            return res.status(403).json({success:false,message:"Your account has been deactivated"});
        }
    
        const token = signToken(user._id);
    
        res.status(200).json({success:true,token,user});
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }

}

//to return the currently logged in user
export const getMe = async(req,res) => {
    res.status(200).json({success:true,user:req.user});
}