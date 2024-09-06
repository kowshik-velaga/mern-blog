const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUsername = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        if(existingUsername && existingEmail){
            return res.status(400).json({error:"Both already exists"});
        }
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }
        
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }
        
        // If neither username nor email exists, proceed with registration
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//FORGOT PASSWORD
router.post("/forgotpassword", async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const checkuser  = await User.findOne({username:username});
        const checkemail = await User.compare({email:email});
        if(!checkuser){
            return res.status(400).json({error:"User not found"});
        }
        if(!checkemail){
            return res.status(400).json({error:"Wrong mail entered"});
        }
        const match = await bcrypt.compare(password,checkuser.password);
        if(match){
            return res.status(400).json({error:"Please use different password from previous one"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        await User.updateOne({username:username},{password:hashedPassword});
        return res.status(200).json({message:"Password Update Succesfully"}); 
    }catch(err){
        res.status(500).json(err);

        
    }
})
//LOGIN

router.post("/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Check if user is currently blacklisted
        if (user.failedLoginAttempts >= 3 && user.lastFailedLoginAt.getTime() + (60 * 60 * 1000) > Date.now()) {
            return res.status(403).json({ error: "User is temporarily blocked. Try again after 1 hour" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            // Increment failed login attempts
            user.failedLoginAttempts += 1;
            user.lastFailedLoginAt = new Date();
            await user.save();

            // If failed attempts exceed 3, block the user for one hour
            if (user.failedLoginAttempts >= 3) {
                setTimeout(async () => {
                    user.failedLoginAttempts = 0;
                    user.lastFailedLoginAt = undefined;
                    await user.save();
                }, 60 * 60 * 1000); // Unblock user after 1 hour
            }

            return res.status(401).json({ error: "Wrong credentials!" });
        }

        // Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.lastFailedLoginAt = undefined;

        // Even on successful login, maintain the blacklist status
        if (user.failedLoginAttempts >= 3) {
            user.failedLoginAttempts = 0;
            user.lastFailedLoginAt = new Date();
        }

        await user.save();

        if (rememberMe) {
            const token=jwt.sign({_id:user._id,username:user.username,email:user.email},process.env.SECRET,{expiresIn:"7d"})
            const {password,...info}=user._doc
            res.cookie("token",token).status(200).json(info)
          } else {
            const token=jwt.sign({_id:user._id,username:user.username,email:user.email},process.env.SECRET,{expiresIn:"15m"})
            const { password: _, ...info } = user._doc;
            res.cookie("token",token).status(200).json(info);
          }
        }catch (err) {
            res.status(500).json(err);
          }
});
    
      
//LOGOUT
router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token", { sameSite: "none", secure: true }).status(200).send("User logged out successfully!");

    } catch (err) {
        res.status(500).json(err);
    }
});



//REFETCH USER
router.get("/refetch", (req, res) => {
    const token = req.cookies.token;
    jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
        if (err) {
            return res.status(404).json(err);
        }
        res.status(200).json(data);
    });
});

module.exports = router;