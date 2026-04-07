import User from "../models/user.model.js";

//MARK: get /api/users
export const getAllUsers = async(req,res)=>{
    try{
        const users = await User.find().sort({createdAt:-1});
        res.status(200).json({success:true,count:users.length,users});
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
}

//MARK: get /api/user/:id
export const getUserById = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
           return res.status(404).json({success:false,message:"User not found"});
        }
            res.status(200).json({success:true,user});
    }catch(err){
         res.status(500).json({success:false,message:err.message});
    }
};


//MARK: patch /api/user/:id/role
export const updateUserRole = async(req,res)=>{

    try{
        const {role} = req.body;
        const validRoles = ["viewer","analyst","admin"];
        if(!role || !validRoles.includes(role)){
            res.status(400).json({success:false,message:`Role must be one of: ${validRoles.join(',')}`});
        }

        if(req.params.id === req.user._id.toString()){
            return res.status(400).json({success:false,message:"You cannot change your own role"});
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {role},
            {new:true,runValidators:true}
        );

        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
         res.status(200).json({ success: true, user });

        

       
    }catch(err){
        return res.status(500).json({success:false,message:err.message});
    }

};

//MARK: patch /api/users/:id/status
export const updateUserStatus = async(req,res)=>{
    try{
        const {status} = req.body;
        const validStatus = ["active","inactive"];
        if(!status || !validStatus.includes(status)){
            return res.status(400).json({success:false,message:`Status must be one of: ${validStatus.join(",")}`});

        } 

        //check to prevent user from decativating its own account
        if(req.params.id === req.user._id.toString() ){
            return res.status(400).json({success:false,message:"You cannot deactivate your own account"});

        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {status},
            {new:true,runValidators:true}
        );

        if(!user){
                  return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({success:true,message:"User not found"});

    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }

}
