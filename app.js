var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');
var usersRouter = require('./routes/users');
var positionRouter = require('./routes/position');
var categoryRouter = require('./routes/category');
var shopRouter = require('./routes/shop');
var adminRouter = require('./routes/admin');
var statisRouter = require('./routes/stais');

var bodyParser = require('body-parser');
//连接数据库
const mongodb = require('./mongodb/connect')

var app = express();

// 解决请求参数过大问题
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/img', uploadRouter);
app.use('/users', usersRouter);
app.use('/position', positionRouter);
app.use('/category', categoryRouter); // 商家分类路由
app.use('/shopping', shopRouter);
app.use('/admin', adminRouter);
app.use('/statis', statisRouter);

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
