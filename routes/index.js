const express = require('express');
const router = express.Router();

//Get welcome page
router.get('/', (req, res) => {
    res.render('welcome');
});

const ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view dashboard');
    res.redirect('/users/login');
}

//Get dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;