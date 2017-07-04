import _ from "lodash";

export default {
    name: 'chat',
    data () {
        return {
            isOtherUserTyping: false,
            newMessage: '',
            statuses: {
                OFFLINE: 'Offline',
                ONLINE: 'Online'
            },
            status: null,
            typingIndicator: ''
        }
    },
    computed: {
        sortedMessages: function () {
            return this.$store.state.messages.sort(function (a, b) {
                if (a._id > b._id) {
                    return -1;
                }

                if (a._id < b._id) {
                    return 1;
                }

                return 0;
            });
        },
        users: function () {
            return this.$store.state.users;
        }
    },
    created: function () {
        var self = this;

        self.$store.state.socket.on('output', function (data) {
            self.$store.commit('setMessages', data);

            self.$store.state.messageNotif.play();
        });

        self.$store.state.socket.on('updateUsersConnected', function (data) {
            if (Array.isArray(data)) {
                _.each(data, function (user) {
                    user.avatar = _.sample(self.$store.state.avatars);
                });

                self.$store.commit('setUsers', data);
            }
        });

        self.$store.state.socket.on('updateTyping', function (data) {
            self.typingIndicator = data.username;
            self.isOtherUserTyping = true;

            var timeout = setTimeout( function(){
                self.isOtherUserTyping = false;
                clearInterval(timeout);
            }, 1300);
        });
    },
    mounted: function() {
        this.status = this.statuses.ONLINE;
    },
    methods: {
        getUserAvatar: function (user) {
            return user.avatar;
        },
        isOwnMessage: function (message) {
            return message.user_id === this.$store.state.currentUser._id;
        },
        submitMessage: function (event) {
            var self = this;
            var message = self.newMessage;
            var username = self.$store.state.currentUser.username;

            if (event.which === 13 && event.shiftKey === false) {
                event.preventDefault();

                self.$store.state.socket.emit('input', {
                    user_id: self.$store.state.currentUser._id,
                    username: username,
                    message: message
                });

                self.newMessage = '';
            } else {
                self.$store.state.socket.emit('typing', {
                    username: username
                });
            }
        },
        setStatus: function (status) {
            this.status = status;
        }
    }
}