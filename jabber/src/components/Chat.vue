<template src="./../jabber/chatbox/chatbox.html"></template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./../jabber/chatbox/chatbox.css" scoped></style>

<script>
export default {
    name: 'chat',
    data () {
	    return {
	        messages: [],
	        statuses: {
                OFFLINE: 'Offline',
                ONLINE: 'Online'
	        },
	        status: null,
            socket: null
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

                var notification = new Audio('../static/notif.mp3');
                notification.volume = 0.1;

                //Notify when user connects
                self.socket.on('connect', function(){
                    //var name = chatName.value;
                    self.socket.emit('userJoined', { name : 'name here!'});
                });

                //Listen for output
                self.socket.on('output', function (data) {
                    self.messages = data;
                });
            }
        },
        setStatus: function (status) {
            this.status = status;
        }
    }
}
</script>