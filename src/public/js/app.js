const socket = new WebSocket(`ws://${window.location.host}`)

const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nick");
const nicknameFormBtn = nicknameForm.querySelector("button");
const messageForm = document.querySelector("#message");
const messageFormBtn = messageForm.querySelector("button");

const messageType = {
    "nickname" : "nickname",
    "newMessage" : "new_message"
}

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

//connection
socket.addEventListener('open', () => {console.log('Connected to Server')});

//message
socket.addEventListener('message', (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
})

//disconnection
socket.addEventListener('close', () =>{
    console.log("Disconneted from Server");
})

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage(messageType.newMessage, input.value));
    input.value = "";
}
messageFormBtn.addEventListener("click", handleSubmit);

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMessage(messageType.nickname, input.value));
}
nicknameFormBtn.addEventListener("click", handleNickSubmit);