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
		socket.on('userTyping', function (data) {
			socket.broadcast.emit('updateTyping', {username: data.username});
		});

        // //Notify all clients that a new user has connected
        socket.on('attemptUserLogin', function (data) {
            var email = data.email;
            var username = data.username;

            if (!(email && username)) {
                console.log('Invalid email or username supplied');
                return;
            }

            var usernameRegex = new RegExp('^' + username + '$');
            var emailRegex = new RegExp('^' + email.toLowerCase() + '$', "i");

            users.find({'email': emailRegex, 'username': usernameRegex}).limit(1).toArray(function (error, result) {
				// If an error occurred when searching for the user
				if (error !== null) {
					socket.emit('loginAttemptResult', {
						error: error,
						success: false
					});

					return;
				}

				// Check if user was not found
				if (result.length === 0) {
					socket.emit('loginAttemptResult', {
						error_code: 604,	// Error Code 404 will be user not found
						error: 'User not found',
						success: false
					});

					return;
				}

				// Check if user is already logged in
				var user = result[0];

				// Error out if user is already logged in
				if (user.isLoggedIn) {
					socket.emit('loginAttemptResult', {
						error_code: 600,
						error: 'User is already logged in',
						success: false
					});

					return;
				}

				// Attempt to set user to logged in
				users.updateOne({
					_id: user._id
				}, {
					$set: {isLoggedIn: true}
				}).then(function (result) {
					if (result.result.nModified === 1) {
						socket.emit('loginAttemptResult', {
							success: true
						});
					} else {
						socket.emit('loginAttemptResult', {
							error_code: 601,
							error: 'Unable to login user',
							success: false
						});
					}
				}, function (error) {
					socket.emit('loginAttemptResult', {
						error: error,
						success: false
					});
				});
            });
        });

		socket.on('getConnectedUsers', function (data) {
			getConnectedUsers(true, updateConnectedUsers);
		});

        socket.on('attemptUserSignUp', function (data) {
            var username = data.username;
            var email = data.email.toLowerCase();

            if (!(email && username)) {
                console.log('Invalid email or username supplied');
                return;
            }

            var newUser  = {email : email, username: username, isLoggedIn: false};

			var respond = function (result) {
				socket.emit('userSignUpAttemptResult', {
					data: result
				});
			};

            users.insertOne(newUser).then(function (result) {
				users.find({_id: result.insertedId}).limit(1).toArray(function (error, result) {
					socket.emit('userSignUpAttemptResult', {
						error: error,
						data: result[0]
					});
				});
			}, respond);
        });

		socket.on('userLeft', function (data) {
			var username = data.username;

			users.deleteMany({username: username}, function(error, result) {
			    getConnectedUsers(true, updateConnectedUsers);
			});
		});

		//Wait for input
		socket.on('newUserMessage', function (data) {
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
	


	

