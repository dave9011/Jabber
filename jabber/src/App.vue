<template src="./jabber/app.html"></template>
<style src="./jabber/app.css"></style>

<script>
import ChatBox from './components/Chat'
import SignIn from './components/SignIn'

export default {
    name: 'app',
    components: {
        SignIn,
        ChatBox
    },
    data () {
	    return {
	        currentUser: {
	            _id: null,
	            username: null,
	            email: null
	        },
	        isUserSignedIn: false,
	        messages: [],
	        notification: null,
	        socket: null,
	        users: []
	    }
    },
    created: function () {
        if (!this.initConnection()) {
            alert('Unable to connect to server!');
        }
    },
    methods: {
        checkUserName: function (data) {
            var self = this;

            if (!data.username || !data.email) {
                alert('Please enter a username and/or email');
                this.isUserSignedIn = false;
                return;
            }

            self.socket.emit('attemptLogin', {
                username : data.username,
                email : data.email
            });
        },
        onMessageSubmit: function (data) {
            this.socket.emit('input', {
                user_id: this.currentUser._id,
                username : data.username,
                message : data.message
            });
        },
        initConnection: function () {
            var self = this;

            try {
                this.socket = io.connect('http://127.0.0.1:8080');
            } catch(error) {
                console.log(error);
                return false;
            }

            if (this.socket) {
                self.notification = new Audio('../static/notif.mp3');
                self.notification.volume = 0.1;

                this.socket.on('loginAttemptResult', function (result) {
                    if (result && result.valid === true) {
                        alert(result.username + ' connected!');

                        // Set current user details
                        self.currentUser = result.user;

                        self.isUserSignedIn = true;
                    } else {
                        alert('Unable to login user with email: ' + result.user.email);
                    }
                });

                this.socket.on('output', function (data) {
                    self.messages = self.messages.concat(data);

                    // MongoDB contains a timestamp in the first 8 digits of the object's ID, we'll get the time from there
                    self.messages.forEach(function (message) {
                        var timestamp = message._id.toString().substring(0,8);

                        message.time = new Date(parseInt(timestamp, 16) * 1000).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                        });
                    });

                    self.notification.play();
                });

                self.socket.on('updateUsersConnected', function (data) {
                    if (data.length) {
                        self.users = data;
                    }
                });

                /**

                //Notify when user connects
                self.socket.on('connect', function(){
                    //var name = chatName.value;
                    self.socket.emit('userJoined', {email : 'hrdavidl@gmail.com'});
                });

                **/
            }

            return true;
        },
    }
}
</script>
