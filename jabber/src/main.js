// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import store from "./../vuex/store";
import io from "socket.io-client";

Vue.config.productionTip = false;

Vue.directive('focus', {
    inserted: function (el, binding, vnode) {
        Vue.nextTick(function() {
            el.focus()
        })
    }
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: {
        App
    },
    created: function () {
        try {
            store.state.socket = io.connect('http://127.0.0.1:8080');
        } catch(error) {
            console.log(error);
            alert('Unable to connect to server!');
        }
    }
});
