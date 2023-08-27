const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const employeeSChema = new mongoose.Schema({
  firstname: {
    type: String,
    required:true,
  },
  lastname: {
    type: String,
    required:true,
  },
  email: {
    type: String,
    required:true,
    unique:true
  },
  gender: {
    type: String,
    required:true,
  },
  phone: {
    type: String,
    required:true,
    unique:true
  },
  password: {
    type: String,
    required:true,
    unique:true
  },
  confirmPassword: {
    type: String,
  },
  tokens: [{
    token:{
      type:String,
      required:true,
    }
  }],
});

// jwt 

employeeSChema.methods.generateAuthToken = async function(){
  try {

    const token = jwt.sign({_id: this._id.toString()},process.env.SECRET_KEY);
    // console.log(token);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    return token;

  } catch (error) {

    console.log("token",error);

  }
}

// hashing

employeeSChema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmPassword = await bcrypt.hash(this.password, 10);
    // this.confirmPassword = undefined;
  }
  next();
});

const Register = new mongoose.model("Register", employeeSChema);

module.exports = Register;
