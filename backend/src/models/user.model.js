import mongoose  from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:[2,"Name must be at least 2 characters"],
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password:{
        type:String,
        required:true,
        minLength:[6,"Password must be at least 6 characters"],
        select: false,

    },
    role:{
        type:String,
        enum:["viewer","analyst","admin"],
        default:'viewer',
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active",

    }

},{timestamps:true});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
}

 const User = mongoose.model("User",userSchema);
export default User;