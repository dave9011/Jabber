<template src="./../jabber/chatbox/chatbox.html"></template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./../jabber/chatbox/chatbox.css" scoped></style>

<script>
export default {
    name: 'chat',
    props: ['messages', 'users', 'currentUser'],
    data () {
	    return {
	        isOtherUserTyping: false,
	        newMessage: '',
	        notification: null,
	        statuses: {
                OFFLINE: 'Offline',
                ONLINE: 'Online'
	        },
	        status: null,
            socket: null,
            typingIndicator: ''
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
        this.status = this.statuses.ONLINE;
    },
    methods: {
        getMessages: function () {
            var self = this;

            /**

            if (self.socket) {
                self.socket.on('updateTyping', function(data) {
                    self.typingIndicator = data.name + " ...";
                    self.isOtherUserTyping = true;

                    var timeout = setTimeout( function(){
                        self.typingIndicator = '';
                        clearInterval(timeout);
                    }, 1300);
                });
            }

            */
        },
        isOwnMessage: function (message) {
            return message.user_id === this.currentUser._id;
        },
        onNewMessageSubmit: function (event) {
            var self = this;

            var userName = self.currentUser.username;
            var message = self.newMessage;

            if (event.which === 13 && event.shiftKey === false) {
                event.preventDefault();

                this.$emit('submitMessage', {
                    username: userName,
                    message: message
                });

                self.newMessage = '';
            } else {
                /**
                self.socket.emit('typing', {
                    username : userName
                });
                */
            }
        },
        setStatus: function (status) {
            this.status = status;
        }
    }
}
</script>