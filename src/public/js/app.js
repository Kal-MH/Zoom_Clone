const socket = io();

const myFace = document.getElementById("myFace");
const mutedBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");
call.hidden = true;

let roomName;

let myStream;
let muted = false;
let cammeraOff = false;
let myPeerConnection;

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCameras = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCameras.label === camera.label)
                option.selected = true;
            camerasSelect.appendChild(option);
        })
    } catch(e) {console.log(e);}
}

async function getMedia(deviceId) {
    const initialConstraints =  {
        autio : true,
        video : {facingMode: "user"}
    };
    const cameraConstraints = {
        audio : true,
        video : {deviceId : {exact : deviceId}}
    }

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        getCameras();
        if (!deviceId) {
            await getCameras();
        }
    } catch(e) {console.log(e);}
}

function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (cammeraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cammeraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cammeraOff = true;
    }
}

function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        mutedBtn.innerText = "Unmute";
        muted = true;
    } else {
        mutedBtn.innerText = "Mute";
        muted = false;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender) =>sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

mutedBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// welcome Form
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//socket code

socket.on("welcome", async () => {
    const offer =await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer)=>{
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    console.log("sent the answer");
    socket.emit("answer", answer, roomName);
})

socket.on("answer", (answer) => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", (ice)=>{
    console.log("candidate");
    myPeerConnection.addIceCandidate(ice);
})

//RTC code
function handleIce(data) {
    console.log("sent candidate");
    console.log(data);
    socket.emit("ice",  data.candidate, roomName);
}
function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    console.log("myPeerConnection : ", myPeerConnection);
    myStream
        .getTracks()
        .forEach((track)=> myPeerConnection.addTrack(track, myStream));
}