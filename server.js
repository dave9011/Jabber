// Load the core LoDash build.
var _ = require('lodash/core');

var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/jabber', function(error, db) {
	if (error) {
		throw error;
	}

	_.each(client.sockets, function (socket) {
		socket.disconnect(true);
	});

	client.on('connection', function (socket) {
		console.log('Someone has connected');

		var messages = db.collection('messages');
		var users = db.collection('users');

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
			socket.broadcast.emit('updateTyping', {username: data.username});
		});

        // //Notify all clients that a new user has connected
        socket.on('attemptLogin', function (data) {
            var email = data.email;
            var username = data.username;

            if (!email) {
                console.log('Invalid email supplied: ' + email);
                return;
            }

            var usernameRegex = new RegExp('^' + username + '$');
            var emailRegex = new RegExp('^' + email.toLowerCase() + '$', "i");

            users.find({'email': emailRegex, 'username': usernameRegex}).limit(1).toArray(function (error, result) {
                var response;

                if (result.length > 0) {
                    response = {
                        email: email,
                        user: result[0],
                        username: result[0].username ? result[0].username : username,
                        valid: true
                    }
                } else {
                    response = {
                        email: email,
                        user: null,
                        username: username,
                        valid: false
                    }
                }

                socket.emit('loginAttemptResult', response);

                if (response.valid) {
					messages.find().sort({'_id': -1}).limit(80).toArray(function(error, result) {
						if (error) {
							throw error;
						}

						socket.emit('output', result);
					});

					getConnectedUsers(false, updateConnectedUsers);
				}
            });
        });

		//Notify all clients that a new user has connected
		socket.on('userJoined', function (data) {
			var email = data.email;

            if (!email) {
                console.log('Invalid email supplied: ' + email);
                return;
            }

			users.insert({email : email}, function (error, result) {
				if (error && error.code === 11000) {
					console.log(email + ' already exists!');
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
			var username = data.username;
			var message = data.message;
			var userId = data.user_id;
			var whiteSpacePattern = /^\s*$/;

			if(whiteSpacePattern.test(username) || whiteSpacePattern.test(message)){
				sendStatus('Name and message is required.');

				return;
			}

			var obj = {
                user_id: userId,
                username : username,
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
			users.createIndex({'email': 1}, {unique: true});
		};

		init();
	});

	console.log('Server initiallized');
});
	


	

