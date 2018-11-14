const passport = require('passport');

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