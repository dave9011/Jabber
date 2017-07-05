import ChatBox from "./../components/Chat";
import SignIn from "./../components/SignIn";

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
    }
}