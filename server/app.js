var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var http = require('http');

var app = express();
app.use(bodyParser());
app.use(serveStatic('game', { 'index': ['index.html'] }));
app.use('/controller', serveStatic('controller', { 'index': ['index.html'] }));

//------------------------------------------------------------------------------

var server = http.createServer(app)
var io = require('socket.io').listen(server, { log: false });

require('./sockets')(io);

var port = Number(process.env.PORT || 5000);
server.listen(port, function() {
	console.log("Listening on " + port);
});