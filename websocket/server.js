var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// var indexRouter = require("./routes/index.js");
var usersRouter = require("./routes/users");
var idePageRouter = require("./routes/idePage.js");

var app = express();

// DB
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://cowede:cowede12345@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";
const Questions = require("./models/questionsModel");

//DB
// mongoose.connect(
//   dbUrl,
//   {
//     dbName: "pairProgramming_new",
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   (err) => {
//     if (err) {
//       return console.log(err);
//     } else {
//       console.log("DB/ODM is connected");
//     }
//   }
// );

// Questions.findOne({ problem_id: 1 }, (err, result) => {
//   if (err) {
//     console.log(err);
//   } else {
//     // console.log(result);
//   }
// });

app.io = require("socket.io")();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/test", idePageRouter);

//방 변수들
let pairmamber = 2;
let roomIndex = 1;
let order = 1;

let rooms = []; //방정보들 저장

// /editor/?level=num GET 요청 시,
app.get("/editor", (req, res) => {
  res.sendFile(__dirname + "/public/editor.html"); // editor.html 띄워준다.

  var Lv = req.query.level; // queryParameter로 받은 level -> 매칭에 쓰임

  app.io.on("connection", (socket) => {
    // 소켓
    socket["nickname"] = "Anon"; // 초기 닉네임 설정
    console.log("소켓 생성, 매칭 시작");

    //기존 방 확인
    if (rooms.find((room) => room.level === Lv)) {
      // 들어가고자 하는 레벨의 방 존재한다면
      const room = rooms.find((room) => room.level === Lv);
      const roomId = room.roomId;

      socket.join(roomId); // 입장
      socket.emit("roomIdPass", roomId, console.log("Room 입장 : ", roomId));
      socket.emit("editor_open", roomId);
      socket.to(roomId).emit("welcome");

      room.usable -= 1;
      if (room.usable === 0) rooms.splice(rooms.indexOf(room), 1);
    } else {
      console.log("들어갈방이없어 방생성");

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
      socket.emit("editor_open", roomIndex);
      roomIndex++;
    }

    // console.log(rooms);

    socket.on("disconnect", () => {
      console.log("접속 끊어짐.");
    });

    socket.on("update", (data) => {
      console.log(data.event, data.delta, data.roomId);

      socket.to(data.roomId).emit("update", data);
    });
    socket.on("offer", (offer, roomIndex) => {
      socket.to(roomIndex).emit("offer", offer);
    });
    socket.on("answer", (answer, roomIndex) => {
      socket.to(roomIndex).emit("answer", answer);
    });
    socket.on("ice", (ice, roomIndex) => {
      socket.to(roomIndex).emit("ice", ice);
    });
    socket.on("new_message", (msg, roomIndex, done) => {
      socket.to(roomIndex).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });
  });
});

module.exports = app;

/*
    //기존 방 확인
    for (var a = 0; a < rooms.length; a++) {
      if (rooms[a].level === Lv) {
        //방입장
        socket.join(rooms[a].roomId);
        socket.emit(
          "roomIdPass",
          rooms[a].roomId,
          console.log("Room 입장 : ", rooms[a].roomId)
        );
        socket.to(rooms[a].roomId).emit("welcome");

        rooms[a].usable -= 1;
        if (rooms[a].usable == 0) rooms.splice(a, 1); //방이 꽉차면 숨김

        return;
      }
    }

    //새로운 방 생성
    console.log("들어갈방이없어 방생성");
    rooms.push({
      roomId: roomIndex,
      level: Lv, //사용자 숙련도 레벨
      usable: 2, //방 최대인원
    });
    socket.join(roomIndex);
    // console.log("room : ", roomIndex);
    rooms[rooms.length - 1].usable -= 1;
    socket.emit(
      "roomIdPass",
      roomIndex,
      console.log("Room 생성 : ", roomIndex)
    );
    roomIndex++;
    */
