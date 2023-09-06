const { userModel, otpModel } = require("../Model/UserModel");
const { allres } = require("../Utils/allres");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { sendEmail } = require("../Utils/Sendmail");

exports.createuser=async(req,res)=>{
        try{
        const sameuser = await userModel.findOne({email:req.body.email})
        const samedepart = await userModel.findOne({department:req.body.department,ugpg:req.body.ugpg,semester:req.body.semester})
        if(samedepart){
            return res.status(400).send("This department already register");
        }else{
        if(sameuser){
            return res.status(400).send("Already register");
        }else{
            const user = await userModel.create(req.body);
            const token = await user.getToken();
            res.header("auth",token).status(200).send(token)  
        }
    }
    }catch(err){
        res.status(400).send("error occured")
    }
 
}

exports.loginuser = async(req,res)=>{
    console.log(req.body);
    try{
        const userdata = await userModel.findOne({email:req.body.email})
        if(!userdata){
            return res.status(400).send("Craete new account")
        }
        const isPassword = await bcrypt.compare(req.body.password, userdata.password)
        if(isPassword){
            const token = await userdata.getToken();
            res.status(200).header("auth",token).send(token)
        }else{
            res.status(400).send("Wrong password")
        }
    }catch(err){
        res.status(400).send("error occured")
    }
}

exports.sendEmail = async (req, res) => {
    try {
        const userEmail = await userModel.findOne(req.body)
        if (!userEmail) {
            return res.status(400).send("Enter valid email")
        }
       
            const otps = await otpModel.findOne({ userId: userEmail.id })
            if (!otps) {
                var otpGenerate = Math.random();
                otpGenerate = otpGenerate * 1000000;
                otpGenerate = parseInt(otpGenerate);
                const otp = await otpModel.create({ otp: otpGenerate, userId: userEmail._id, expire: Date.now() + 2 * 60 * 1000 })
                sendEmail(req.body.email, otp.otp);
                res.status(200).send("OTP send to your email")
            } else {
                await otpModel.findByIdAndRemove(otps._id)
                var otpGenerate = Math.random();
                otpGenerate = otpGenerate * 1000000;
                otpGenerate = parseInt(otpGenerate);
                const otp = await otpModel.create({ otp: otpGenerate, userId: userEmail._id, expire: Date.now() + 2 * 60 * 1000 })
                sendEmail(req.body.email, otp.otp);
                res.status(200).send("its ok")
            }

    } catch (err) {
        res.status(400).send(err)
    }

}

exports.optValid = async (req, res) => {
    try {
        console.log(req.body.email);
        const userEmail = await userModel.findOne({ email: req.body.email })
        const otp = await otpModel.findOne({ userId: userEmail.id })
        if (req.body.otp == otp.otp) {
                res.status(200).send(otp)
            
        } else {
            res.status(400).send("Please enter valid OTP")
        }
    } catch (err) {
        res.status(400).send("error")
    }
}


exports.changePassword = async (req, res) => {
    console.log(req.body);
    const userEmail = await userModel.findOne({ email: req.body.email }).select('-password')
    if (!userEmail) {
        return res.status(400).send("Enter valid email")
    }
    const otp = await otpModel.findOne({ userId: userEmail.id })
    if (!otp) {
        return res.status(400).send("Enter valid otp")
    }
    if (req.body.otp == otp.otp) {
        if (otp.expire < Date.now()) {
            await otpModel.findByIdAndRemove(otp._id)
            res.status(203).send("OTP has been expired")
        } else {
            const passwordEncrypt = await bcrypt.hash(req.body.password, 10)
            await userModel.findByIdAndUpdate({ _id: userEmail.id }, { password: passwordEncrypt })
            await otpModel.findByIdAndRemove(otp._id)
            res.status(200).send("Password Successfully Change")
        }
    }

}