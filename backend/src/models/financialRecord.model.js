import mongoose from "mongoose";

const financialRecordSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
        min:[0.01,"amount should be greater than 0"],
    },
    type:{
        type:String,
        enum:["income","expense"],
        required:true,
    },
    category:{
        type:String,
        required:[true,"category is required"],
        trime:true,
    },
    date:{
        type:Date,
        required:true,
    },
    notes:{
        type:String,
        trim:true,
        maxLength:[500,"notes cannot exceed 500 characters"],
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    
    
},{timestamps:true});

financialRecordSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
 
});

const FinancialRecord = mongoose.model("FinancialRecord",financialRecordSchema);
export default FinancialRecord;