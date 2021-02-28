var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./config/connection')
var session=require('express-session')
var fileUpload=require('express-fileupload')
var dotenv=require('dotenv').config()
const Handlebars = require('handlebars');
const H = require('just-handlebars-helpers');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var hbs=require('express-handlebars')
H.registerHelpers(Handlebars);
var app = express();
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {  maxAge: 5000000}
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({
  helpers: {
    math: function (lvalue, opeator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue,
      }[opeator];
    }
  },
  extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
db.connect((err)=>{
  if(err){
    console.log(err)
  }else{
    console.log('database connected')
  }
})

app.use('/', adminRouter);
app.use('/', usersRouter);
app.use((req,res)=>{
  res.status(404).render('user/404')
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
