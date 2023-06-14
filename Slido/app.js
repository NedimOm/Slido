var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var multer = require('multer');

var session = require('express-session');
var session2 = require('express-session');
var pgSession = require('connect-pg-simple')(session);
var flash = require('express-flash');

var indexRouter = require('./routes/index');
var administratorRouter = require('./routes/administrator')
var predavacRouter = require('./routes/predavac');


var app = express();


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, (new Date().toISOString().slice(0, 13)) + '-' + file.originalname);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage}).single('image'));
app.use(cookieParser());
app.use(flash());

app.use(session2({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.use(session({
  store: new pgSession({
    conString: 'postgresql://postgres:16011601@localhost/postgres'
  }),
  secret: 'odJedanDoOsam',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000}
}));
app.use(passport.authenticate('session'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/predavac', predavacRouter);
app.use('/administrator', administratorRouter);
app.use('*', function (req, res, next) {
  if(req.isAuthenticated() && req.user.uloga == false){
    res.redirect('/predavac');
  }
  else if(req.isAuthenticated())
    res.redirect('/administrator');

  res.redirect('/login');
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
