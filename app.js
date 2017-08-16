var express = require('express');
app = express();

var server = require('http').createServer(handler)
var io = require('socket.io')(server);
var fs = require('fs');

server.listen(3000);
console.log('Server Running');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var users = [];
var connections = [];


io.sockets.on('connection', function(socket) {
	connections.push(socket);
	// console.log('Connected %s sockets connected', connections.length);

	function updateOnline() {
		io.sockets.emit('update online', users.length);
	}
	function appendAvatar() {
		var usersData = [];
		for(var i = 0; i < users.length; i++) {
			usersData[i] =  users[i].nickname;
		}
		io.sockets.emit('update avatars', usersData);
	}

	// Send Message
	socket.on('msg', function(data) {
		console.log(data);
		// send all users this recived data
		io.sockets.emit('new data', data);
	});

	// creatig new user
	socket.on('new user', function(data) {
		users.push({
			nickname: data,
			id : socket
		});
		console.log(data + ' connected');
		io.sockets.emit('welcome user', data);
		updateOnline();
		appendAvatar();
	});


	// disconnection
	socket.on('disconnect', function(data) {

		for(var i = 0; i < users.length; i++) {
			if(users[i].id == socket) {

				io.sockets.emit('user leave', users[i].nickname);

				console.log(users[i].nickname + ' disconected');
				users.splice(i, 1);
			}
		}
		connections.splice(connections.indexOf(socket), 1);
		updateOnline();
		appendAvatar();
		
	});

});