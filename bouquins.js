var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var _ = require('underscore');
var i18n = require('i18next');

var home = require('./routes/home');
var author = require('./routes/author');
var book = require('./routes/book');
var tag = require('./routes/tag');
var serie = require('./routes/serie');

i18n.init({
	saveMissing: false,
	debug: true
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// load config
_.extend(app.locals, require('./config/'+app.get('env')+'.json'));
var appPackage = require('./package.json');
app.locals.appname = appPackage.name;
app.locals.appversion = appPackage.version;
app.locals.appurl = appPackage.url;

// nginx
app.enable('trust proxy');

// db setup
var dbPath = app.locals.calibre_db_path;
console.log('Database: ' + dbPath);
var db = new sqlite3.Database(dbPath);

app.use(function(req, res, next) {
	req.db = db;
	req.locals = app.locals;
	next();
});

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(i18n.handle);

i18n.registerAppHelper(app);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/locales',express.static(path.join(__dirname, 'locales')));
app.use('/calibre', express.static(app.locals.calibre_path));

app.use('/', home);
app.use('/author', author);
app.use('/book', book);
app.use('/tag', tag);
app.use('/serie', serie);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	console.error(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
