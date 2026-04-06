import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDb from "./src/config/db.config.js";


import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import recordRoutes from "./src/routes/records.routes.js";

const app = express();
app.use(express.json());
 
const PORT =  process.env.PORT || 8000;


app.use(cors({origin:process.env.CLIENT_URL || 'http://localhost:5173' ,credentials :true}));

//MARK: routes
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/records",recordRoutes);
app.use("/api/dashboard",dashboardRoutes);


app.get("/health",(_req,res)=>{
    res.json({status:"Ok"});
});

//global error handler
app.use((err,_req,res,_next)=>{
    const status = err.statusCode || 500;
    const message = err.message || "Internal server error";

    if(process.env.NODE_ENV === "development"){
        console.error(err.stack);
    }

    res.status(status).json({success:false,message});

});





//start
connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`server running at localhost:${PORT}`);
    });
});


app.get("/",(_req,res)=>{
    res.send("this is root ");
});



