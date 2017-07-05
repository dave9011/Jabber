import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// The root, initial state object
const state = {
    avatars: [
        './static/avatars/avatar-male-1.svg',
        './static/avatars/avatar-male-2.svg',
        './static/avatars/avatar-male-3.svg',
        './static/avatars/avatar-female-1.svg',
        './static/avatars/avatar-female-2.svg',
        './static/avatars/avatar-female-3.svg'
    ],
    currentUser: null,
    loggedIn: false,
    messages: [],
    messageNotif: null,
    socket: null,
    users: [],
};

// define the possible mutations that can be applied to our state
const mutations = {
    setCurrentUser: (state, user) => state.currentUser = user,
    setLoggedIn: (state) => {
        state.currentUser.loggedIn = true;
        state.loggedIn = true
    },
    setLoggedOut: (state) => {
        state.currentUser.loggedIn = false;
        state.loggedIn = false
    },
    setMessages: (state, data) => {
        // MongoDB contains a timestamp in the first 8 digits of the object's ID, we'll get the time from there
        data.forEach(function (message) {
            var timestamp = message._id.toString().substring(0, 8);

            message.time = new Date(parseInt(timestamp, 16) * 1000).toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });
        });

        state.messages = state.messages.concat(data);
    },
    setUsers: (state, data) => state.users = data
};

const getters = {
    user: state => {
        return state.currentUser;
    }
};

// create the Vuex instance by combining the state and mutations objects
// then export the Vuex store for use by our components
export default new Vuex.Store({
    state,
    mutations,
    getters
})