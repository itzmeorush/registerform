require('dotenv').config();
const express = require('express');
const app = express();
require('./db/connect');
const path = require('path');
const hbs = require('hbs');
const Register = require('./db/models/registers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 3000;

const staticPath = path.join(__dirname,'../public');
// console.log(path.join(__dirname,'../public'));
const templatePath = path.join(__dirname,'/templates/views');
const partialsPath = path.join(__dirname,'/templates/partials');

app.use(express.static(staticPath));
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);
app.use(express.urlencoded({extended:false}));


// console.log(process.env.SECRET_KEY);
app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/secret',auth,(req,res)=>{
  res.render('secret');
})

app.get('/logout',auth,async(req,res)=>{
  try {
    console.log('logout Successfully');
    req.user.tokens = req.user.tokens.filter((curElm)=>{
      return curElm.token !== req.token;
    })
    res.clearCookie('jwt');
    await req.user.save();
    res.render('login');

  } catch (error) {
    res.status(500).send(error)
  }
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
  res.render('login')
})

// database
app.post('/register', async(req,res)=>{
        try {
          const password = req.body.password;
          const confirmPassword = req.body.confirmPassword;

          if(password === confirmPassword){

            const register = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                password:req.body.password,
                confirmPassword:req.body.confirmPassword,
            });

            const token = await register.generateAuthToken();

            res.cookie("jwt",token,{
              expires:new Date(Date.now() + 800000),
              httpOnly:true
            });
            // console.log(cookie);

            const data = await register.save();
            res.status(201).render("index");
            console.log(data);

            
          }else{
            res.send('Password not matching !')
          }



        } catch (error) {
            res.status(400).send(error);
        }
});
// login
app.post('/login',async(req,res)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({email:email});

    const isMatch = bcrypt.compare(password,userEmail.password);

    const token = await userEmail.generateAuthToken();
    console.log(token);

    res.cookie("jwt",token,{
      expires:new Date(Date.now()+80000),
      httpOnly:true,
      secure:true,
    });
 
    if(isMatch){
      res.status(200).render('index');
    }else{
      res.send('Invalid user details');
    }

  } catch (error) {
    res.status(400).send('invalid email')
  }
})

app.listen(port,()=>{
    console.log(`Server is running at port no ${port}`);
});