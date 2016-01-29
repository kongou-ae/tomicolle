var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var tomicaList = require('./tomica-list.json')
var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy;
var db = require('./couchdb.js')
var CronJob = require("cron").CronJob

// 開発環境用パラメータ読み込み
require('dotenv').load();

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session());


app.use('/', router);

router.get('/',function(req,res){
  res.render('index', {
       title: 'login page',
       session: req.session.passport
  });
})

router.get('/publish/:id',function(req,res){
  res.render('publish', {
       title: 'publish page',
       id: req.params.id
  });
})

// DB関係ない単なるトミカAPI
router.get('/api', function(req, res) {
    res.json({ message: 'this is tomica-list api' });
});

router.get('/api/v1', function(req, res) {
    res.json({ message: 'This is tomica api version 1.1. /car/ displays all cars. /car/:id displays the car of this number.' });
});

router.get('/api/v1/car/',function(req, res) {
    res.json(tomicaList)
});

router.get('/api/v1/car/:num',function(req, res) {
    var num = Number(req.params.num) - 1
    res.json(tomicaList.carData[num])
})

// /oauthにアクセスした時
router.get('/auth/twitter', passport.authenticate('twitter'), function (req, res, next) {
    console.log("starting oauth");
});
 
// /oauth/callbackにアクセスした時（Twitterログイン後）
router.get('/auth/twitter/callback',passport.authenticate('twitter', { failureRedirect: '/#/login' }), function(req, res) {
    res.redirect('/'); //indexへリダイレクトさせる
});

// DBへのアクセス時にoAuth認証がされているかをチェックする関数
var auth = function(req, res, next){
  if (!req.isAuthenticated()) {
    res.send(401);
  } else {
    next();
  }
};

// DBへのAPIアクセス
router.get('/api/v1/pos/car/',auth,db.read)
router.post('/api/v1/pos/car/',auth,db.create)
router.put('/api/v1/pos/car/',auth,db.update)
router.get('/api/v1/pos/car/publish/',db.publish)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message)
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// oauth
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// テスト環境でoauthを動作させるための処理。
if (process.env.VCAP_SERVICES){
  var url = 'http://tomicolle.aimless.jp/'
} else {
  var url = process.env.localUrl
}

var consumerKey = process.env.twitter_consumerKer
var consumerSecret = process.env.twitter_consumerSecrer

passport.use(new TwitterStrategy({
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        callbackURL:  url + "auth/twitter/callback"//Twitterログイン後、遷移するURL
    },
    function (token, tokenSecret, profile, done) {
        profile.uid = profile.provider + profile.id;
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// datadogでBluemixを監視する
var metrics = require('datadog-metrics');
metrics.init({
  host: 'tomicolle',
  prefix: 'status.', 
  apiKey: process.env.datadogKey
});

function putStatusTomicolle() {
    metrics.gauge('available',1);
};

// Bluemix上であれば、Datadogによる監視を開始
if (process.env.VCAP_SERVICES){
  new CronJob("*/30 * * * * *", putStatusTomicolle, null, true)
}

module.exports = app;
