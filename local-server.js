
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.set('views','/');

app.use('/', express.static(path.join(__dirname, '/')));

var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index');
});

app.listen(process.env.PORT || 3000, process.env.IP || "localhost", function(){
  
  console.log("Server listening at ", process.env.IP + ":" + process.env.PORT);
})