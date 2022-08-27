var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var idePageRouter = require("./routes/idePage.js");

var app = express();
app.io = require("socket.io")();

// DB
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://cowede:cowede12345@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";
const Questions = require("./models/questionsModel");
const { resolve } = require("path");

//DB
mongoose.connect(
  dbUrl,
  {
    dbName: "pairProgramming_new_edit",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      return console.log(err);
    } else {
      console.log("DB/ODM is connected");
    }
  }
);

//app.use(logger("dev")); // 받는 Request 로그 찍어준다.
app.use(express.json()); // JSON 형태의 request body 받았을 경우 파싱
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/test", idePageRouter);

let roomIndex = 1;
let rooms = []; //방정보들 저장
let Lv = 0;

let result; //

// /editor/?level=num GET 요청 시,
const num_of_ques = 2;

app.get("/editor", (req, res) => {
  Lv = req.query.level; // queryParameter로 받은 level

  run();
  async function run() {
    // const result = await Questions.aggregate([
    //   { $match: { problem_level: parseInt(Lv) } },
    //   { $sample: { size: num_of_ques } },
    // ]);

    result = await Questions.aggregate([
      { $match: { problem_level: parseInt(Lv) } },
      { $sample: { size: num_of_ques } },
    ]);

    // console.log(result);

    // let elProblemTitle = document.querySelector("#problem-title");
    // elProblemTitle.textContent = result[0].problem_title;
  }

  // let asdf = new Promise(() => {
  //   // Lv = req.query.level; // queryParameter로 받은 level
  //   let result;
  //   run();
  //   async function run() {
  //     result = await Questions.aggregate([
  //       { $match: { problem_level: parseInt(Lv) } },
  //       { $sample: { size: num_of_ques } },
  //     ]);
  //   }
  //   // }
  //   return result;
  // })
  //   .then((result) => {
  //     console.log("result: ", result);
  //   })

  res.sendFile(__dirname + "/public/editor.html"); // editor.html 띄워준다.
});

app.io.on("connection", (socket) => {
  // 소켓
  socket["nickname"] = "상대방"; // 초기 닉네임 설정
  console.log("Matching ....");
  socket.emit("editor_open");
  socket.emit("test", result);

  //기존 방 확인
  socket.on("join_room", () => {
    if (rooms.find((room) => room.level === Lv)) {
      // 들어가고자 하는 레벨의 방 존재한다면
      const room = rooms.find((room) => room.level === Lv);
      const roomId = room.roomId;

      socket.join(roomId); // 입장
      socket.emit("roomIdPass", roomId, console.log("Room 입장 : ", roomId));
      socket.to(roomId).emit("welcome", roomId);

      room.usable -= 1;
      if (room.usable === 0) rooms.splice(rooms.indexOf(room), 1);
    } else {
      rooms.push({
        // Room 생성
        roomId: roomIndex,
        level: Lv, //사용자 숙련도 레벨
        usable: 2, //방 최대인원
      });

      socket.join(roomIndex);
      rooms[rooms.length - 1].usable -= 1;
      socket.emit(
        "roomIdPass",
        roomIndex,
        console.log("Room 생성 : ", roomIndex)
      );
      roomIndex++;
    }
  });

  socket.on("disconnect", () => {
    console.log("접속 끊어짐.");
  });

  socket.on("update", (data) => {
    console.log(data.event, data.delta, data.roomId);

    socket.to(data.roomId).emit("update", data);
  });
  socket.on("offer", (offer, roomId) => {
    socket.to(roomId).emit("offer", offer);
  });
  socket.on("answer", (answer, roomId) => {
    socket.to(roomId).emit("answer", answer);
  });
  socket.on("ice", (ice, roomId) => {
    socket.to(roomId).emit("ice", ice);
  });
  socket.on("new_message", (msg, roomId, done) => {
    socket.to(roomId).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
});

module.exports = app;
