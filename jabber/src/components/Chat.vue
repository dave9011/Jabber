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
    mounted: function() {
        this.status = this.statuses.STATUS_OFFLINE;

        this.getMessages();
    },
    methods: {
        getMessages: function () {
            var self = this;

            try {
                self.socket = io.connect('http://127.0.0.1:8080');
            } catch(error) {
                //Set status to warn user
                console.log(error);
                alert('Unable to connect to server!');
            }

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
                    self.messages = data;
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
        isOwnMessage: function (message) {
            return message.name == 'Dave';
        },
        onNewMessageSubmit: function (event) {
            this.newMessage = this.newMessage.trim();

            var self = this;
            var userName = 'David'; // TODO: udpate this to show current user's name

            if(event.which === 13 && event.shiftKey === false){
                event.preventDefault();
                var date = new Date();
                var time = date.getHours()%12 + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes();

                self.socket.emit('input', {
                    name : userName,
                    message : self.value,
                    time : time
                });

                console.log(self.notification);

                self.notification.play();
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