const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local',{
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successFlash: 'You are logged in',
    successRedirect: '/',
});
exports.logout = (req, res)=> {
    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must login');
    res.redirect('/login');
};
exports.forgot = async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user){
        req.flash('error', 'A password reset ha been send to yor email');
        return res.redirect('/login');
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 360000;
    await user.save();
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        subject: 'Password Reset',
        resetURL,
        filename: 'password-reset',
    });
    req.flash('success', `Check your email to reset your password.`);
    res.redirect('/login');
};

exports.reset = async(req,res)=>{
    const { token: resetPasswordToken } = req.params;
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user){
        req.flash('error', 'Invalid or expired token');
        return res.redirect('/login');
    }
    res.render('reset', { title: 'Reset your password' })
};
exports.confirmedPasswords = (req,res, next)=>{
    if(req.body.password === req.body['password-confirm']){
       return next(); 
    }
    req.flash('error', `Passwords don't match`);
    res.redirect('back');
};
exports.update = async(req,res)=>{
    const { token: resetPasswordToken } = req.params;
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user){
        req.flash('error', 'Invalid or expired token');
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Password has been reset!');
    res.redirect('/');
};