'use strict';

var express = require('express')
var app = express()
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static('public'));
// app.set('view engine', 'ejs');
// app.set('views','./views');

// decleare variable
var listAccount=[];

// render ejs file
// app.get('/', function (req, res) {
//   res.render('index');
// });

//event socket.io
//socketIO
io.on("connection",function(socket){
  console.log("User Connection: "+socket.id);
  socket.on("disconnect",function(){
      console.log("User disconnection: "+socket.id);
  });
  socket.on("client-send-offer",function(offer){
      console.log("client-send-offer: " + offer);
      //only send to other client
      socket.broadcast.emit("server-send-offer",offer);
      //send to all client
      //io.sockets.emit("return message",msg,socket.id);
  });

  socket.on("client-send-answer",function(answer){
    console.log("client-send-answer: " + answer);
    //only send to other client
    socket.broadcast.emit("server-send-answer",answer);
    //send to all client
    //io.sockets.emit("return message",msg,socket.id);
  });

  socket.on("client-send-new-ice-candidate",function(new_ice_candidate){
    socket.broadcast.emit("server-send-new-ice-candidate",new_ice_candidate);
  });

});


http.listen(process.env.PORT || 3000,function(){
    console.log("listening on: 3000");
});