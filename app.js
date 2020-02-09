var express = require('express')
var app = express()
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views','./views');

// decleare variable
var listAccount=[];

// render ejs file
app.get('/', function (req, res) {
  res.render('index');
});

//event socket.io


http.listen(3000,function(){
    console.log("listening on: 3000");
});