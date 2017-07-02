<template>
	<div class="">
	    <div class="flex_wrapper outer">
            <div class="chat_messages">
                <div class="chat_message" v-for="message in messages">
                    <span>[{{message.time}}] {{message.name}}: </span>{{message.message}}
                </div>
            </div>
            <div class="typing"></div>
            <div class="flex_wrapper inner">
                <textarea id="chat_area" placeholder="Type your message" spellcheck="false"></textarea>

                <div class="chat_status">Status: <span>Idle</span></div>
                <div class="connections"><h3>Who's here?</h3></div>
            </div>
	  </div>
	</div>
  </div>
</template>

<script>
export default {
    name: 'chat',
    data () {
	    return {
	        messages: []
	    }
    },
    mounted: function() {
        this.getMessages();
    },
    methods: {
        getMessages: function () {
            var self = this;

            try {
                var socket = io.connect('http://127.0.0.1:8080');
            } catch(error) {
                //Set status to warn user
                console.log(error);
            }

            if(socket !== undefined){
                //setStatus('Welcome!');

                //var notif_sound = new Audio("sound/notif.mp3");
                //notif_sound.volume = 0.1;

                //Notify when user connects
                socket.on('connect', function(){
                    //var name = chatName.value;
                    socket.emit('userJoined', { name : 'name here!'});
                });

                //Listen for output
                socket.on('output', function (data) {
                    self.messages = data;
                });
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flex_wrapper {
	display: flex;
}

.hide {
	display: none;
	overflow: hidden;
	border-top: 2px solid #FB0C59;
}

.outer {
	position: relative;
}

.inner {
	flex-direction: column;
	flex-grow: 1;
	width: 35%;
	max-height: 100%;
}

.chat {
	max-width: 60%;
	min-width: 300px;
	/* min-height: 300px; */
	margin: 0 auto;
	margin-top: 5%;
	box-shadow: 0 2px 6px #A5A5A5;
	background-color: #EBEBEB;
}

.chat_messages {
	font-size: 1.1vw;
	width: 70%;
	height: 500px;
	overflow-y: scroll;
	padding: 2%;
	color: #3C3B3B;
	border: 1px solid transparent;
	border-right: 1px solid #CACACA;
}

/*
.chat_messages::before {
	display: block;
	content:"";
	position: absolute;
	height: 100%;
	width: 100%;
	background: orange;
	color: white;
}
*/

.chat_messages span {
	color: #363C3D;
   font-weight: bold;
}

.chat_messages,
.chat textarea,
.chat_name {
	/* border: 1px solid #FB0C59; */
	background-color: rgb(235, 235, 235);
}

#chat_area {
	width: 100%;
	border-top: none;
	max-width: 100%;
	color: #363C3D;
	font-size: 1.2vw;
	flex-grow: 6;
	max-width: 100%;
	resize: none;
	margin-top: 2px;
	border: none;
	border-bottom: 1px solid #CACACA;
	padding-left: 4%;
	padding-top: 4%;
}

.chat_name {
	width: 100%;
	background-color: rgba(237,235,236,0.9);
   color: #363C3D;
   font-size: 2.4vw;
   border-color: #132426;
   border: none;
   font-weight: bold;
	padding: 3%;
	padding-left: 12.5%;
	font-family: 'Lora', serif;
}

.name_container {
	position: relative;
}

.name_container::before {
	content:"";
	display: block;
	position: absolute;
	top:50%;
	left:0;
	background: url('/static/ic_user.png') no-repeat;
	background-size: contain;
	background-position-x: 50%;
	height: 60%;
    width: 13%;
	transform: translateY(-50%);
}

.chat_message {
	margin-bottom: 3%;
   padding-bottom: 1%;
	word-break: break-all;
}

.chat_message > img {
	max-width: 50%;
	max-height: 250px;
	margin-top: 6px;
}

.chat_status {
	background-color: rgb(54, 60, 61);
   padding: 10px 10px;
   color: #EBEBEB;
   font-size: 1.2vw;
   text-align: center;
   margin-top: 0;
}

.typing {
	visibility: hidden;
	position: absolute;
	left:0;
	bottom: 0;
	width: 65%;
	color: #FFF;
   font-size: 1.2vw;
   background-color: #FA0C58;
   padding: 0.5% 2%;
}

.connections {
	flex-grow: 2;
	padding-left: 3%;
	overflow-y: scroll;
	font-size: 1vw;
	max-height: 130px;
}

.connection h3 {
   margin: 0.6em 0;
}

.accent {
	color: #FB0C59 !important;
}

.chat ::-webkit-scrollbar {
   width: 5px;
}

.chat ::-webkit-scrollbar-track {
   background-color: transparent;
}

.chat ::-webkit-scrollbar-thumb {
   background-color: #FB0C59;
   border-radius: 15px;
} /* this will style the thumb, ignoring the track */
</style>
