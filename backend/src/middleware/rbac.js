
const ROLE_HIERARCHY = {viewer: 0,analyst:1,admin:2};

const requireRole = (minRole) =>(req,res,next)=>{
    const userLevel =  ROLE_HIERARCHY[req.user?.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;


    if(userLevel< requiredLevel){
        return res.status(403).json({success:false,message:`Access denied ${minRole} role or more required`});
    }
    next();
};

export default requireRole;

