


var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function(err, db){

	if(err) throw err;
	
	client.sockets.forEach(function(s) {
		 s.disconnect(true);
	});
	
	client.on('connection', function(socket){
	
		console.log('Someone has connected');
		
		var col_messages = db.collection("messages");
		var col_users_connected = db.collection("users_connected");
		
		col_users_connected.createIndex( { "name": 1 }, { unique: true } )
		
		var sendStatus = function(s){
			socket.emit('status', s);
		  };		
			  
		//Emit all messages on connection
		col_messages.find().sort({ $natural: -1 }).limit(80).toArray( function(err, res){
			if(err) throw err;
			res.reverse();
			socket.emit('output', res);
		});
		
		 function updateUsersConnected(isClientEmit, data){
			if(data){  
				if(isClientEmit){
					client.emit('updateUsersConnected', data);
				} else {
					socket.emit('updateUsersConnected', data);
				}
				
			};
		}
		
		getUsersConnected(false, updateUsersConnected);
		
		//Retrieve all array with all documents users connected collection and call
		//the addUsersConnected() function to notify all other clients someone has connected
		function getUsersConnected(isClientEmit, callback){		
			col_users_connected.find({}).toArray( function(err, res){
				callback(isClientEmit, res);
			});
		}
		
		//When typing detected
		socket.on('typing', function(data) {
			socket.broadcast.emit('updateTyping', { name : data.name });
		});
		
		//Notify all clients that a new user has connected
		socket.on('userJoined', function(data){
			var name = data.name;
			col_users_connected.insert({name : name}, function(err, res){
				if(err && err.code === 11000){
					console.log(name + "already exists!");
				} else {
					getUsersConnected(true, updateUsersConnected);
				}
			});
		});
		
		socket.on('userLeft', function(data){
			var name = data.name;
			col_users_connected.deleteMany( 
				{"name":name}, 
				function(err, results){
					getUsersConnected(true, updateUsersConnected);
				}
			);
		});

		//Wait for input
		socket.on('input', function(data){
			
			var name = data.name,
				 message = data.message,
				 time = data.time,
				 whiteSpacePattern = /^\s*$/;
				 
			if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
				sendStatus('Name and message is required.');
			} else {
				
				var obj = {name : name, message : message, time : time};
				if("isLink" in data){
					obj.isLink = data.isLink;
				}
				col_messages.insert(obj, function(){
				
					//Emit latest message to ALL clients
					client.emit('output', [data]);
					
					sendStatus({
						message : "Message sent",
						clear : true
					});
					
				});
				
			}
				
		});
		
	});

});
	


	

