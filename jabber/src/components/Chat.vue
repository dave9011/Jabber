<template src="./../jabber/chatbox/chatbox.html"></template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./../jabber/chatbox/chatbox.css" scoped></style>

<script>
export default {
    name: 'chat',
    data () {
	    return {
	        isOtherUserTyping: false,
	        messages: [],
	        newMessage: '',
	        notification: null,
	        statuses: {
                OFFLINE: 'Offline',
                ONLINE: 'Online'
	        },
	        status: null,
            socket: null,
            typingIndicator: '',
            users: []
	    }
    },
    computed: {
        sortedMessages: function () {
            return this.messages.sort(function (a, b) {
                if (a._id > b._id) {
                    return -1;
                }
                if (a._id < b._id) {
                    return 1
                }

                return 0;
            });
        }
    },
    mounted: function() {
        this.status = this.statuses.STATUS_OFFLINE;

        if (!this.initConnection()) {
            alert('Unable to connect to server!');
        }

        this.getMessages();
    },
    methods: {
        getMessages: function () {
            var self = this;

            if (self.socket !== undefined) {
                self.setStatus(self.statuses.ONLINE);

                self.notification = new Audio('../static/notif.mp3');
                self.notification.volume = 0.1;

                //Notify when user connects
                self.socket.on('connect', function(){
                    //var name = chatName.value;
                    self.socket.emit('userJoined', { name : 'name here!'});
                });

                self.socket.on('updateUsersConnected', function (data) {
                    if (data.length) {
                        self.users = data;
                    }
                });

                //Listen for output
                self.socket.on('output', function (data) {
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

                self.socket.on('updateTyping', function(data) {
                    self.typingIndicator = data.name + " ...";
                    self.isOtherUserTyping = true;

                    var timeout = setTimeout( function(){
                        self.typingIndicator = '';
                        clearInterval(timeout);
                    }, 1300);
                });
            }
        },
        initConnection: function () {
            try {
                this.socket = io.connect('http://127.0.0.1:8080');
            } catch(error) {
                console.log(error);
                return false;
            }

            return true;
        },
        isOwnMessage: function (message) {
            return message.name == 'Dave';
        },
        onNewMessageSubmit: function (event) {
            var self = this;

            var message = self.newMessage;
            var userName = 'David'; // TODO: udpate this to show current user's name

            if (event.which === 13 && event.shiftKey === false) {
                event.preventDefault();

                self.socket.emit('input', {
                    name : userName,
                    message : message
                });

                self.newMessage = '';
            } else {
                self.socket.emit('typing', {
                    name : userName
                });
            }
        },
        setStatus: function (status) {
            this.status = status;
        }
    }
}
</script>