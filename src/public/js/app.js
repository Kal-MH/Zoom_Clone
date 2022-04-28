const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
    event.preventDefault();

    const input = form.querySelector("input");
    console.log(input.value);
    socket.emit("enter_room", {payload : input.value}, () => {
        console.log("server is done");
    });
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);