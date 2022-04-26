import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

//save each sockets
const sockets = [];
const messageType = {
    "nickname" : "nickname",
    "newMessage" : "new_message"
}

wss.on('connection', (socket) => {
    console.log('connected to Browser');
    socket["nickname"] = "Anonymous";
    sockets.push(socket);

    socket.on('close', () => {console.log("Disconnected from the Browser")});
    socket.on('message', (message) => {
        const parsed = JSON.parse(message);
        switch(parsed.type) {
            case messageType.nickname :
                socket["nickname"] = parsed.payload;
                break ;
            case messageType.newMessage :
                sockets.forEach(aSocket => { 
                    aSocket.send(`${socket.nickname} : ${parsed.payload.toString('utf-8')}`)
                });
        }
    })
})

server.listen(3000, handleListen);