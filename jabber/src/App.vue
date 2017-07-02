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
    data () {
	    return {
	        isUserSignedIn: false
	    }
    },
    methods: {
        checkUserName: function (data) {
            if(!data.isValid){
                alert('Please enter a username');
                this.isUserSignedIn = false;
                return;
            }

            this.isUserSignedIn = true;
        }
    }
}
</script>
