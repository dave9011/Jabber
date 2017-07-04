<template src="./../jabber/sign-in/sign-in.html"></template>
<style scoped src="./../jabber/sign-in/sign-in.css"></style>\

<script>
export default {
    name: 'sign-in',
    data () {
	    return {
	        email: '',
	        username: ''
	    }
    },
    created: function () {
        var self = this;

        self.$store.state.socket.on('loginAttemptResult', function (result) {
            if (result && result.valid === true) {
                alert(result.username + ' connected!');

                self.$store.commit('setCurrentUser', result.user);
                self.$store.commit('setLoggedIn');

                self.$store.state.socket.emit('userJoined', {email: self.$store.state.currentUser.email});
            } else {
                alert('Unable to login user with email: ' + result.email);
            }
        });
    },
    methods: {
        onSubmit: function (event) {
            var username = this.username.trim();
            var email = this.email.trim().toLowerCase();

            if (username && email) {
                this.$store.state.socket.emit('attemptLogin', {
                    username: username,
                    email: email
                });
            } else {
                this.$store.state.loggedIn = false;

                alert('Please supply a valid username and email');
            }
        }
    }
}
</script>