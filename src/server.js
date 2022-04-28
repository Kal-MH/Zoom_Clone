import express from "express";
import SocketIO from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket)=>{
    socket.on("enter_room", (msg, done) => {
        console.log(msg);
        setTimeout(() => {
            done();
        }, 10000);
    })
})

//save each sockets
// const wss = new WebSocket.Server({server});
// const sockets = [];
// const messageType = {
//     "nickname" : "nickname",
//     "newMessage" : "new_message"
// }

// wss.on('connection', (socket) => {
    //     console.log('connected to Browser');
    //     socket["nickname"] = "Anonymous";
    //     sockets.push(socket);
    
    //     socket.on('close', () => {console.log("Disconnected from the Browser")});
//     socket.on('message', (message) => {
    //         const parsed = JSON.parse(message);
    //         switch(parsed.type) {
//             case messageType.nickname :
//                 socket["nickname"] = parsed.payload;
//                 break ;
//             case messageType.newMessage :
//                 sockets.forEach(aSocket => { 
//                     aSocket.send(`${socket.nickname} : ${parsed.payload.toString('utf-8')}`)
//                 });
//         }
//     })
// })

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);
httpServer.listen(3000, handleListen);