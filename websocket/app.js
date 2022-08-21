
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.io = require("socket.io")();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//방 변수들
let pairmamber = 2;
let roomIndex = 1;
let order = 1;

let rooms = []; //방정보들 저장

//새 웹 소켓 접속시
app.io.on("connection", (socket) => {

    console.log("새로 접속.");
    
    /*
    //방만들기
    console.log("roomId: ",roomId);
    socket.join(roomId);
    socket.emit("roomIdPass",roomId);
    // roomID -> socket.id로해도될듯
    
    if(order % pairmamber == 0){
        roomId++;
    }
    order++;
    */
    
    socket.on("userInfoGet", (data) => {
        console.log("level: ", data.level);

        //기존 방 확인
        for(var a = 0; a<rooms.length; a++){
            if(rooms[a].level == data.level){
                //방입장
                socket.join(rooms[a].roomId);
                console.log("join roomId: ",rooms[a].roomId);
                socket.emit("roomIdPass",rooms[a].roomId);
                
                rooms[a].usable -= 1;
                if(rooms[a].usable == 0)
                    rooms.splice(a, 1); //방이 꽉차면 숨김

                return ;
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
        console.log("join roomId: ",roomIndex);
        rooms[rooms.length-1].usable -= 1;
        socket.emit("roomIdPass",roomIndex);
        roomIndex++;

    });


    socket.on("disconnect", () => {
        console.log("접속 끊어짐.");
    });

    
    socket.on("update", (data) => {
        console.log(data.event, data.delta, data.roomId);
        
        socket.to(data.roomId).emit("update", data);
    })
})

module.exports = app;
