const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");
room.hidden = true;
let roomName;

/*
 * Enter the Room
 */
function handleMessageSubmit(event) {
    event.preventDefault();

    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You : ${value}`);
    })
    input.value = "";
}
function showRoom () {
    room.hidden = false;
    welcome.hidden = true;

    const h3 = room.querySelector("h3");
    h3.innerText = roomName;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();

    const input = form.querySelector("input");
    roomName = input.value;
    socket.emit("enter_room", roomName, showRoom);
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

/*
 * Listen Welcome Event
 */
function addMessage(msg) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}
socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
})

/*
 * Disconnecting event
 */
socket.on("bye", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount});`
    addMessage(`${user} is left!`);
})

/*
 * New Message event
 */
socket.on("new_message", addMessage);

/*
 * Room Change event
 */
socket.on("room_change", (rooms) => {
    const ul = welcome.querySelector("ul");
    ul.innerHTML = "";

    if (rooms.length === 0)
        return ;

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        ul.append(li);
    })
})