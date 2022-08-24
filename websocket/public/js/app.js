const socket = io();

const muteBtn = document.getElementById("mute");
const micsSelect = document.getElementById("mics");
const call = document.getElementById("call");
const editor = document.getElementById("editor");

let myStream;
let muted = false;
let roomId = 0;
let myPeerConnection;
let myDataChannel;

// 마이크 목록 불러오기
async function getMics() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((device) => device.kind === "audioinput");
    const currentMic = myStream.getAudioTracks()[0];
    mics.forEach((mic) => {
      const option = document.createElement("option");
      option.value = mic.deviceId;
      option.innerText = mic.label;
      if (currentMic.label === mic.label) {
        // stream의 오디오와 paint할 때의 오디오 option을 가져와서 비교 후, stream의 오디오를 paint 하도록 한다.
        option.selected = true;
      }
      micsSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: false, // false로 놓음으로써 카메라 사용 X
  };
  const micsConstraints = {
    audio: { deviceId: { exact: deviceId } },
    video: false,
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? micsConstraints : initialConstraints
    );
    myVoice.srcObject = myStream;
    if (!deviceId) {
      await getMics();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleMicChange() {
  getMedia(micsSelect.value); // 이 코드를 통해 mic의 stream이 변경됐음.
  if (myPeerConnection) {
    const audioTrack = myStream.getAudioTracks()[0];
    const audioSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "audio");
    audioSender.replaceTrack(audioTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
micsSelect.addEventListener("input", handleMicChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  editor.hidden = false;
  call.hidden = false;
  await getMedia(); // 음성 장치 불러오기
  makeConnection(); // P2P 연결
}

socket.on("editor_open", async (roomIndex) => {
  await initCall();
  roomId = roomIndex;
});

// async function handleWelcomeSubmit(event) {
//   event.preventDefault();
//   const input = welcomeForm.querySelector("input");
//   await initCall();c
//   socket.emit("userInfoGet", {
//     level: input.value,
//   });
//   roomId = input.value;
//   input.value = "";
// }

// welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/**
 * Socket Code
 * P2P 연결
 */

// peerB가 들어왔다는 알림을 받는 peerA에서 실행
socket.on("welcome", async (roomIndex) => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomId);
});

// peerA의 offer를 받게 되는 peerB에서 실행
socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomId);
  console.log("sent the answer");
});

// peerB의 answer를 받는 peerA에서 실행
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

/**
 * 채팅
 */

const chat = document.getElementById("chat");
const msgForm = chat.querySelector("#msg");
const nameForm = chat.querySelector("#name");

socket.on("new_message", addMessage);

//html에 메시지 출력
function addMessage(message) {
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 메시지 전송
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = chat.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomId, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

msgForm.addEventListener("submit", handleMessageSubmit);

// 닉네임 설정
// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = chat.querySelector("#name input");
//   socket.emit("nickname", input.value);
//   input.value = "";
// }

// nameForm.addEventListener("submit", handleNicknameSubmit);

/**
 * RTC Code
 */

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getAudioTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomId);
}

function handleAddStream(data) {
  const peerVoice = document.getElementById("peerVoice");
  peerVoice.srcObject = data.stream; // 상대 브라우저의 stream 정보(data.stream)를 home.pug의 video#peerFace에 넣어준다.
}

/**
 * 동시편집, 방 만들기
 */

hljs.configure({
  // optionally configure hljs
  languages: ["javascript", "ruby", "python", "cpp"],
});

const quill = new Quill("#editor", {
  modules: {
    syntax: true, // Include syntax module
    toolbar: [["code-block"]], // Include button in toolbar
  },
  theme: "snow",
});

//https://quilljs.com/docs/api/#editor-change
quill.on("editor-change", function (eventName, ...args) {
  if (eventName === "text-change") {
    // args[0] will be delta
    console.log("text-change: ", args[0]);
  } else if (eventName === "selection-change") {
    // args[0] will be old range
    console.log("selection-change: ", args[0]);
  }

  if (args[2] && args[2] === "user") {
    socket.emit("update", {
      event: eventName,
      delta: args[0],
      roomId: roomId,
    });
  }
});

socket.on("connect", function () {
  console.log("connected");
});

/* 유저정보 최종 형식
    socket.emit("userInfoGet", {
          level: 5,
          language: 1,
        });
    */

socket.on("update", function (data) {
  const eventName = data.event;
  const delta = data.delta;
  if (eventName === "text-change") {
    quill.updateContents(delta);
  } else if (eventName === "selection-change") {
    quill.setSelection(delta.index, delta.length);
  }
});

socket.on("roomIdPass", function (data) {
  roomId = data;
  // console.log("Room에 입장했습니다 : ", roomId);
});
