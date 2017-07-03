<template src="./../jabber/sign-in/sign-in.html"></template>
<style scoped src="./../jabber/sign-in/sign-in.css"></style>\

<script>
export default {
    name: 'sign-in',
    props: ['isUserSignedIn'],
    data () {
	    return {
	        email: '',
	        username: ''
	    }
    },
    methods: {
        onSubmit: function (event) {
            this.username = this.username.trim();
            this.email = this.email.trim();

            if (this.email && this.username) {
                this.$emit('inputUsername', {
                    username: this.username,
                    email: this.email
                });
            } else {
                alert('Please supply a valid username and email');
            }
        }
    }
}
</script>