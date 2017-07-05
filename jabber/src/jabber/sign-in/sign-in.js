export default {
    name: 'sign-in',
    data () {
        return {
            email: 'hrdavidl@gmail.com',
            username: 'Davey',
            isCreating: false
        }
    },
    created: function () {
        var self = this;

        self.$store.state.socket.on('loginAttemptResult', function (result) {
            if (result.success) {
                self.$store.commit('setCurrentUser', result.user);
                self.$store.commit('setLoggedIn');
            } else {
                var message = result.error || 'Unable to login user';

                alert(message);
            }
        });

        self.$store.state.socket.on('userSignUpAttemptResult', function (result) {
            if (result.error === null) {
                self.$store.commit('setCurrentUser', result.data);

                // Attempt to log in user using data returned
                self.$store.state.socket.emit('attemptUserLogin', result.data);
            } else {
                if (result.error && result.error.code === 11000) {
                    alert('That user already exists!');
                } else {
                    alert('Unable to create user!');
                }
            }
        });
    },
    methods: {
        toggleIsCreating: function () {
            this.isCreating = !this.isCreating;
        },
        onSubmit: function () {
            var self = this;
            var username = self.username.trim();
            var email = self.email.trim().toLowerCase();

            if (!(username && email)) {
                self.$store.state.loggedIn = false;

                alert('Please supply a valid username and email');
            }

            var data = {
                username: username,
                email: email
            };

            if (this.isCreating) {
                self.$store.state.socket.emit('attemptUserSignUp', data);
            } else {
                self.$store.state.socket.emit('attemptUserLogin', data);
            }
        }
    }
}