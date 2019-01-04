const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');

//Get login page
router.get('/login', (req, res) => res.render('login'));

//Get register page
router.get('/register', (req, res) => res.render('register'));

//Create new user
router.post('/register', (req, res, next) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 5) {
        errors.push({ msg: 'Password must be at least 5 characters' });
    }

    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        User.findOne({ where: { email: email} })
        .then(user => {
            if(user) {
                errors.push({ msg: 'This email already exists, try to login.'});
                res.render('register', { errors })
            } else {
                bcrypt.hash(password, 10, (err, hash) => {
                    User.create({
                        email: email,
                        name: name,
                        password: hash,
                    })
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'You are now registered, please login to continue.'
                        );
                        res.redirect('/users/login')
                    })
                    .catch(next);
                })
            }
        })
    }
})

//Login
router.post('/login', passport.authenticate('local'), 
    (req, res) => {
        const { email } = req.body;
        User.findOne({ where: { email: email} })
        .then(user => {
             res.redirect('/dashboard');
        })
    }
)

module.exports = router;