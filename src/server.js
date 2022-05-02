import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer =  new Server(httpServer, {
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true
    },
  });
  
instrument(wsServer, {
    auth: false
});

function publicRooms() {
    const {
        sockets: {
            adapter :{rooms, sids}
        }
    } = wsServer;
    
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket)=>{
    socket["nickname"] = "Anon";
    wsServer.sockets.emit("room_change", publicRooms());

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        //현재 방의 참여자에게 메세지 보내기
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        //모든 socket에 대해서 메세지 보내기
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    })
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
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