// Load the core LoDash build.
var _ = require('lodash/core');

var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function(error, db) {
	if (error) {
		throw error;
	}

	_.each(client.sockets, function (socket) {
		socket.disconnect(true);
	});

	client.on('connection', function(socket) {
		console.log('Someone has connected');

		var messages = db.collection('messages');
		var users = db.collection('users_connected');

		// Retrieve all array with all documents users connected collection and call
		// the addUsersConnected() function to notify all other clients someone has connected
		var getConnectedUsers = function (isClientEmit, callback) {
			users.find({}).toArray(function (error, result) {
				callback(isClientEmit, result);
			});
		};

		var sendStatus = function (status) {
			socket.emit('status', status);
		};

		var updateConnectedUsers = function (isClientEmit, data) {
			if (data) {
				if (isClientEmit) {
					client.emit('updateUsersConnected', data);
				} else {
					socket.emit('updateUsersConnected', data);
				}
			}
		};

		//When typing detected
		socket.on('typing', function (data) {
			socket.broadcast.emit('updateTyping', { name : data.name });
		});

		//Notify all clients that a new user has connected
		socket.on('userJoined', function (data) {
			var name = data.name;

			users.insert({name : name}, function (error, result) {
				if (error && error.code === 11000) {
					console.log(name + ' already exists!');
				}

				getConnectedUsers(true, updateConnectedUsers);
			});
		});

		socket.on('userLeft', function (data) {
			var name = data.name;

			users.deleteMany({
					"name": name
				}, function(error, results){
					getConnectedUsers(true, updateConnectedUsers);
				}
			);
		});

		//Wait for input
		socket.on('input', function (data) {
			var name = data.name;
			var message = data.message;
			var whiteSpacePattern = /^\s*$/;

			if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
				sendStatus('Name and message is required.');

				return;
			}

			var obj = {
				name : name,
				message : message
			};

            if ('isLink' in data) {
                obj.isLink = data.isLink;
            }

			messages.insert(obj, function (error, result) {
				//Emit latest message to ALL clients
				client.emit('output', result.ops);

				sendStatus({
					message : "Message sent",
					clear : true
				});
			});
		});

		var init = function () {
			// Add unique index on user's name
			users.createIndex({'name': 1}, {unique: true});

			// Emit up to 80 messages on connection
			messages.find().sort({'_id': -1}).limit(80).toArray(function(error, result) {
				if (error) {
					throw error;
				}

				socket.emit('output', result);
			});

			getConnectedUsers(false, updateConnectedUsers);
		};

		init();
	});

	console.log('Server initiallized');
});
	


	

