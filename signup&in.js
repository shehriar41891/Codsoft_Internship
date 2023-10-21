const express = require('express');
const User = require('./modal/user')
const Router = express.Router();
const passport = require('passport');

Router.get('/signup', (req, res) => {
    res.render('signup')
})

Router.post('/signup', (req, res) => {
    const { username, password, email } = req.body;
    try {
        User.register({ username, email }, password);
    } catch (error) {
        console.log('The error is ', error);
    }
})

Router.get('/signIn', (req, res) => {
    res.render('login');
})

Router.post('/signIn', passport.authenticate('local',
    { failureRedirect: '/signup' }),
    (req, res) => {
        res.redirect('/');
    })

module.exports = Router;    