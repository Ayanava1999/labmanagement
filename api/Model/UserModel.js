const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const userschema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    department:{type:String,required:true},
    ugpg:{type:String,required:true},
    semester:{type:String,required:true},
    password:{type:String,required:true,minlength:8}
})

const userOtp = new mongoose.Schema({
    otp: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user",require: true },
    expire: { type: Date, require: true },
    date: { type: Date, default: Date.now }
})
exports.otpModel = new mongoose.model('otp', userOtp);


userschema.pre('save',async function(){
    this.password = await bcrypt.hash(this.password,10)
})

userschema.methods.getToken = function(){
    const token = jwt.sign({_id:this._id,name:this.name,ugpg:this.ugpg,semester:this.semester,department:this.department,email:this.email},process.env.JWT_TOKEN);
    return token;
}



exports.userModel = mongoose.model('user',userschema)