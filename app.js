const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const db = require('./db')
const User = require('./models/user');

//Init app
const app = express();

//Passport
passport.use(
  new LocalStrategy((email, password, done) => {
      // Match user
      User.findOne({ where: {email: email} })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        // Match password
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) { return done(err); }
          if (res) {
            console.log('** MATCH FOUND! **')
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
  }) 
);

passport.serializeUser((user, done) => {
  done(null, user.id);
})
passport.deserializeUser((user, done) => {
  User.findByPk(user.id, (err, user) => {
      done(err, user);
  });
});

//View engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Set static folder
app.use(express.static(path.join(__dirname, './public')));

//Express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Connect cookieparser
app.use(cookieParser());

//Connect flash
app.use(flash());

//Global vars for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 8080;

db.sync({ force: false }).then(() => {
  app.listen(PORT, console.log(`Server is listenig on port ${PORT}`))
})
