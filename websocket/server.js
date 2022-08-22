var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

//body-parser 라이브러리 사용 셋팅
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//몽고디비랑 몽구스(ODM) connect
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://adoocavo:rkdwn%403521@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";

mongoose.connect(
  dbUrl,
  {
    dbName: "pairProgramming_new",
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
//모듈(모델) 가져오기
const Questions = require("./models/questionsModel");

//idePage router
app.use("/test", require("./routes/idePage.js"));

Questions.findOne({ problem_id: 1 }, (err, result) => {
  if (err) {
    console.log(err);
  } else {
    // console.log(result);
  }
});

app.io = require("socket.io")();

app.use(logger("dev"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

//방 변수들
let pairmamber = 2;
let roomIndex = 1;
let order = 1;

let rooms = []; //방정보들 저장

//새 웹 소켓 접속시
app.io.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  console.log("새로 접속.");

  socket.on("userInfoGet", (data) => {
    console.log("level: ", data.level);

    //기존 방 확인 c
    for (var a = 0; a < rooms.length; a++) {
      if (rooms[a].level == data.level) {
        //방입장
        socket.join(rooms[a].roomId);
        console.log("join roomId: ", rooms[a].roomId);
        socket.emit("roomIdPass", rooms[a].roomId);

        rooms[a].usable -= 1;
        if (rooms[a].usable == 0) rooms.splice(a, 1); //방이 꽉차면 숨김

        return;
      }
    }

    //새로운 방 생성
    console.log("들어갈방이없어 방생성");
    rooms.push({
      roomId: roomIndex,
      level: data.level, //사용자 숙련도 레벨
      usable: 2, //방 최대인원
    });
    socket.join(roomIndex);
    console.log("join roomId: ", roomIndex);
    rooms[rooms.length - 1].usable -= 1;
    socket.emit("roomIdPass", roomIndex);
    roomIndex++;
  });

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

module.exports = app;
