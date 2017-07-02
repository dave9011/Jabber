<template src="./../jabber/sign-in/sign-in.html"></template>
<style scoped src="./../jabber/sign-in/sign-in.css"></style>\

<script>
export default {
    name: 'sign-in',
    props: ['isUserSignedIn'],
    data () {
	    return {
	        username: ''
	    }
    },
    methods: {
        onSubmit: function (event) {
            this.username = this.username.trim();

            this.$emit('inputUsername', {
                isValid: this.username ? true : false
            });
        }
    }
}
</script>