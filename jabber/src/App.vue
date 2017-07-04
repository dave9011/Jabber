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
    computed: {
        isLoggedIn: function () {
            return this.$store.state.loggedIn;
        }
    },
    created: function () {
        if (!this.initConnection()) {
            alert('Unable to connect to server!');
        }
    },
    methods: {
        initConnection: function () {
            var self = this;

            try {
                this.$store.state.socket = io.connect('http://127.0.0.1:8080');
            } catch(error) {
                console.log(error);
                return false;
            }

            if (this.$store.state.socket) {
                self.$store.state.messageNotif = new Audio('../static/notif.mp3');
                self.$store.state.messageNotif.volume = 0.1;
            }

            return true;
        },
    }
}
</script>
