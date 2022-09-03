//npm install debug cookie-parser express morgan socket.io body-parser ejs mongoose nodemon bcrypt
//npm install --legacy-peer-deps mongoose-auto-increment
//npm install --legacy-peer-deps passport passport-local express-session
//npm install --legacy-peer-deps connect-flash

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); // cors

var idePageRouter = require("./routes/idePage.js");

var app = express();

app.io = require("socket.io")();

app.use(cors()); // cors

// DB
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://cowede:cowede12345@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";
const Questions = require("./models/questionsModel");
const { resolve, dirname } = require("path");

//DB
mongoose.connect(
  dbUrl,
  {
    dbName: "pairPrograming_new_edit_2",
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

//app.use("/test", idePageRouter);

////////////////////////
///////여기부터_회원가입///////////
////////////////////////

//라이브러리 가져오기
const bcrypt = require("bcrypt"); //암호화 모듈 사용

//모델 가져오기
const Users = require("./models/userModel");

//user_counter Collection에 Document 하나 생성 -> 이미 생성해서 주석처리

// '/signUp'경로로 get요청 -> 화원가입 페이지(registerForm.html) 뜨게하기
// app.get("/signUp", function (req, res) {
//   res.sendFile(__dirname + "/public/registerForm.html");
// });

// '/join'으로 post요청하면 -> 계정생성 -> DB에(users Collection에)저장
app.post("/join", async function register(req, res) {
  //화원가입 요청 시 프론트에서 전달받는 데이터 확인
  console.log(req.body);
  console.log(req.body.loginId);

  //form으로 입력받은거 사용 위해 변수 선언해서 저장
  const input_id = req.body.loginId;
  const input_pw = req.body.loginPw;
  const input_pw_confirm = req.body.loginPwConfirm;
  const input_email = req.body.email;
  const input_nickname = req.body.nickname;

  //이메일, 닉네임 중복확인, 패스워드같은지 확인 -> 계정생성
  try {
    const check_id = await Users.findOne({ user_id: input_id });
    const check_email = await Users.findOne({ user_email: input_email });
    const check_nickname = await Users.findOne({
      user_nickName: input_nickname,
    });
    if (check_id) {
      return res
        .status(400)
        .json({ errors: [{ message: "이미 사용중인 아이디입니다ㅠㅠ" }] });
    }

    if (check_email) {
      return res
        .status(400)
        .json({ errors: [{ message: "이미 가입된 이메일입니다ㅠㅠ" }] });
    }

    if (check_nickname) {
      return res
        .status(400)
        .json({ errors: [{ message: "이미 사용중인 닉네임입니다ㅠㅠ" }] });
    }

    if (input_pw != input_pw_confirm) {
      return res
        .status(400)
        .json({ errors: [{ message: "비밀번호를 다시 확인하세욥!" }] });
    }

    //계정생성
    const new_user = await new Users({
      user_id: input_id,

      user_pw: input_pw,

      user_email: input_email,

      user_nickName: input_nickname,

      user_level: {
        //new_user.user_level.java 로 접근

        java: 1,
        c: 1,
        cpp: 1,
        python: 1,
      },

      user_score: {
        java: 0,
        c: 0,
        cpp: 0,
        python: 0,
      },
    });

    new_user.user_correct_ques = [0]; //new_user.user_correct_ques[1~] --> index 1부터 맞춘문제 저장됨

    //pw암호화
    const salt = await bcrypt.genSalt(10);
    new_user.user_pw = await bcrypt.hash(input_pw, salt);

    //users Collection에 새로운 계정 Document 저장 -> 홈페이지로 리다이렉트
    await new_user.save().then((res) => {
      console.log("가입되냐?");
      console.log(res);
    });

    //홈 페이지로 리다이렉트(로그인 한 상태로??)
    // res.redirect("/");

    //프론트에서 res.signUp_check != undefined일때민 로그인 화면으로 넘기기
    res.json({ signUp_check: new_user._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

////////////////////////
///////여기까지_회원가입_end///////////
////////////////////////

/////////////////////////////////////
////////로그인///////////////////////
////////////////////////////////////

//passport다루기 절차
/**
 * 1, 모듈 로딩과 초기화
 * 2.strategy 설정
 * 3.인증 (요청)
 * 4.세션 기록과 읽기
 * 5.세션에서 사용자 정보 읽어오기
 */

////////1. 모듈 로딩, 초기화//////////
////////////////////////////////////
const passport = require("passport");
const { read } = require("fs");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({
    secret: "cowede@1234",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// var flash = require("connect-flash");

// app.use(flash()); //req 들어올때마다 실행

// app.get("/login", (req, res) => {
//   var fmsg = req.flash();
//   var feedback = "";
//   if (fmsg.error) {
//     feedback = fmsg.error[0];
//     console.log("오류는", feedback);
//   }
//   console.log(fmsg);
//   res.sendFile(__dirname + "/public/login.html");
// });

////////3. 인증(요청)//////////////////
////////////////////////////////////
//passport 모듈의 'local'인증기능 사용(passport.authenticate함수 사용해서)
//인증성공 -> 성공메세지 + 성공 페이지 이동(홈페이지로)
//인증실패 -> 실패메세지 + 로그인 페이지로 이동
//유저가 로그인 정보 입력 -> passport가 인증 실시하는 코드

app.post(
  "/login",

  passport.authenticate("local", {
    //OPTION설정
    failureRedirect: "/fail",
    successRedirect: "/success", //홈페이지로 바꿀예정
    passReqToCallback: true,
  })
);

app.get("/fail", (req, res) => {
  //로그인 실패시 로그인 화면 띄어주기
  //프론트에서 res.logInCheck == 'fail' 이면 로그인 화면으로 이동시키기
  res.json({ logInCheck: "fail" });
});

app.get("/success", (req, res) => {
  //로그인 성공시 홈 화면 띄어주기
  //프론트에서 res.logInCheck == 'success' 이면 홈 화면으로 이동시키기
  res.json({ logInCheck: req.user });
});

////////2. strategy 인증 설정//////////
////////////////////////////////////
//local 인증 구현(사용자가 입력한 아이디/비번을 받아서 인증기능 구현)
passport.use(
  new LocalStrategy(
    {
      // login.html에서 사용자가 제출한 아이디가 어떤 <input>인지 <input>의 name 속성값
      usernameField: "id",
      passwordField: "pw",
      session: true, //로그인 후 세션 저장
      passReqToCallback: false,
      failerFlash: true,
    },

    (input_id, input_pw, done) => {
      //프론트에서 입력받은 아디 비번 확인
      console.log("LocalStrategy", input_id, input_pw);

      //디비에 저장된 아이디 비번과 대조해보기
      Users.findOne({ user_id: input_id }, (err, user) => {
        //done(서버에러, 성공시 뱉어낼 사용자DB, 에러메세지)
        if (err) {
          console.log(err);
          return done(err);
        }
        if (!user) {
          //인증실패
          console.log("존재하지 않는 아이디입니다~ㅠㅠ");
          return done(null, false, {
            message: "존재하지 않는 아이디입니다~ㅠㅠ",
          });
        }

        user.comparePassword(input_pw, user.user_pw, (err, isMatch) => {
          if (!isMatch) {
            //인증실패
            console.log("비밀번호가 틀렸어요~ㅠㅠ");
            return done(null, false, { message: "비밀번호가 틀렸어요~ㅠㅠ" });
          } else {
            console.log("보내는거?");
            console.log(user);
            console.log("보낸거??");

            //이게 req.session.userinfo 이렇게 세션에 박아질듯?
            const userInfo = {
              is_logined: true,
              user_id: user.user_id,
              user_nickname: user.user_nickName,
            };

            //인증성공 -> 사용자 정보를(내가 위에서 findOne으로 해당 사용자 document 찾았으니깐
            //여기에서 사용자 document 하나가 세션에 저장되고 넘어감) passpaort의 done 콜백함수로 전달됨
            return done(null, userInfo);
          }
        });
      });
    }
  )
);

////////4. 세션 기록괴 읽기//////////////
////////////////////////////////////

//로그인시 입력하는 사용자 정보 -> 세션으로 저장되어야 한다
//로그인 성공 ->passport.authenticate함수에서 userInfo data를
//serializeUser 메소드에 인자로 전달된 콜백 함수의 첫번째 인자로 주입해주도록 약속됨
//serializeUser 메소드에 인자로 전달된 콜백 함수가 호출되도록 약속됨
//passport.authenticate
//로그인 성공시에 한번 실행 -> 세션스토어에 이미 있는 세션에? 사용자의 식별자가(여기선 userInfo) 저장
passport.serializeUser((user, done) => {
  console.log("ser", user);

  //session data 안에 passport의 user값으로 사용자의 식별자가(userInfo) 들어옴
  done(null, user.user_id);
});

//로그인 이후 페이지 방문때마다 deserializeUser함수의 콜백((id, done))이 호출되도록 약속되오있다
//콜백이 호출될때마다
//세션에서 읽어온 데이터 == req.user
//페이지 방문때마다 세션 스토어에 있는 식별자를 가져와서 -> 실제 데이터 DB에서 꺼내서 주기
passport.deserializeUser((id, done) => {
  console.log("dser", id);

  Users.findOne({ user_id: id }, (err, result) => {
    console.log("dser", result);

    //deserial 함수의 콜백 함수가 호출될 때 두번째 인자로 전달된 result가 req.user로 저장되도록 약속되어있다.
    done(null, result);
  });
});
/////////////////////////////////////
////////로그인_end///////////////////////
////////////////////////////////////

////////////////////////////////////
////////로그아웃///////////////////////
////////////////////////////////////
app.get(
  "/logout",

  async (req, res, next) => {
    await console.log("뭐냐? 로그아웃");
    await console.log(req.user);

    if (req.user != undefined) {
      await console.log("_id: " + req.user.user_id + " 님 로그아웃");

      await req.logOut((err) => {
        if (err) return next(err);
      });

      await req.session.save(() => {
        //프론트에서 res.logOutCheck != success일때 홈 화면으로 넘어가기
        res.json({ logOutCheck: "success" });
      });
    } else {
      console.log(res.user);
      console.log("로그인 상태가 아닙니다");
      res.redirect("/login");

      //프론트에서 res.logOutCheck != fail일때 로그인 화면 넘어가기
      res.json({ logOutCheck: "fail" });
    }
  }
);
////////////////////////////////////
////////로그아웃_end///////////////////////
////////////////////////////////////

/////////////////////////////////////
////////마이페이지///////////////////////
////////////////////////////////////
app.get("/mypage", isAuthenticated, (req, res) => {
  res.json({ userSession: req.user });
});

function isAuthenticated(req, res, next) {
  console.log("뭐냐? 마이페이지");
  console.log(req.user);
  if (req.user != undefined) {
    next();
  } else {
    res.send("로그인 하세요");
  }
}

/////////////////////////////////////
////////마이페이지_end///////////////////////
////////////////////////////////////

/**
 * main에서 가져오기
 * 수정하기전에 브런치 만들기 -> 바로 바꾸기
 *
 *
 */

let roomIndex = 1;
let rooms = []; //방정보들 저장
let clients = new Map(); // 접속해있는 소켓 저장할 Map 객체

let result;

let Lv;
let Lg;
let uid; // 프론트에서 서버로 uid가 안와서 야매로
let user;

let get_done = 0; // get전에 socket연결 방지

// /editor/?level=num GET 요청 시,
const num_of_ques = 2;

//리액트 홈페이지띄우기
app.use(express.static(path.join(__dirname, "react-project/build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "react-project/build/index.html"));
});

app.get("/editor", async (req, res) => {
  get_done = 1;
  uid = req.query.user_id;
  Lg = req.query.language;

  user = await Users.findOne({ user_id: uid });
  Lv = user.user_level[Lg];

  /*
  const user_correct_ques = user.user_correct_ques;
  console.log("lg1 : ",  Lg, uid);
  console.log("correct que: ", user.user_correct_ques);
  run();
  async function run() {
    result = await Questions.aggregate([
      {
        $match: {
          problem_level: parseInt(Lv),
          problem_id: { $nin: user_correct_ques },
        },
      },
      { $sample: { size: num_of_ques } },
    ]);
    console.log("lv: ", Lv);
    console.log("prob_id: ", result[0].problem_id, result[1].problem_id);
  }
  */

  res.sendFile(__dirname + "/public/editor.html"); // editor.html 띄워준다.
});

let leveltest_questions;

app.get("/leveltest", async (req, res) => {
  const uid = req.query.user_id;
  user = await Users.findOne({ user_id: uid });

  let level1;
  let level2;
  let level3;

  await run1();
  await run2();
  await run3();

  async function run1() {
    level1 = await Questions.aggregate([
      { $match: { problem_level: 1 } },
      { $sample: { size: 1 } },
    ]);
  }
  async function run2() {
    level2 = await Questions.aggregate([
      { $match: { problem_level: 2 } },
      { $sample: { size: 1 } },
    ]);
  }
  async function run3() {
    level3 = await Questions.aggregate([
      { $match: { problem_level: 3 } },
      { $sample: { size: 1 } },
    ]);
  }

  leveltest_questions = [...level1, ...level2, ...level3]; // 1레벨,2레벨,3레벨에서 각각 1개씩 랜덤으로 뽑은 문제

  res.sendFile(__dirname + "/public/leveltest.html"); //leveltest 화면 띄워준다.
});

// language ID - 50 : C, 52 : C++, 62 : Java, 71 : Python
function idToLanguage(language_id) {
  switch (language_id) {
    case "50":
      return "c";
    case "52":
      return "cpp";
    case "62":
      return "java";
    case "71":
      return "python";
  }
}

function scoreToLevel(score) {
  if (score < 5) return 1;
  else if (score >= 5 && score <= 9) return 2;
  else if (score >= 10 && score <= 18) return 3;
  else if (score >= 19 && score <= 30) return 4;
  else return 5;
}

/**
 * 채점 성공 시에 User 정보 Update
 * "/editor/solve?user_id=3&question_id=3&language_id=52 GET Request"
 */
app.get("/editor/solve", async (req, res) => {
  const user_id = req.query.user_id;
  const question_id = req.query.question_id;
  const language_id = req.query.language_id;

  //입력받은 language_id 통해서 c / cpp / java / python으로 변환
  const language = idToLanguage(language_id);

  // DB 조회 조건 - user는 userId로 , question은 questionId로 찾는다.
  const questionFilter = { problem_id: question_id };
  const userFilter = { user_id: user_id };

  // 문제를 해결한 user & user가 해결한 문제 DB에서 가져오기
  const question = await Questions.findOne(questionFilter);
  const user = await Users.findOne(userFilter);

  // (1)c, cpp, java, python 외의 languageId (2)존재하지 않는 userId (3)존재하지 않는 questionId 입력 받았을 때 error 발생
  if (!language || !user || !question) {
    return res.status(400).json({
      error:
        "존재하지 않는 userId or 존재하지 않는 questionId or 지원하지 않는 언어",
    });
  }

  // 문제 중복 풀이 방지
  if (question_id in user.user_correct_ques) {
    return res.status(400).json({
      error: "이미 풀었던 문제입니다.",
    });
  }

  // update 쿼리 - 해결한 문제 난이도에 따라 score 변경, user_correct_ques에 question_id 추가
  const userUpdate = {
    $inc: { ["user_score." + language]: question.problem_level },
    $push: { user_correct_ques: question_id }, // 문제 중복으로 들어갈 수 있음 -> 매칭 조건 통해서 중복 방지
  };

  const updateUser = await Users.findOneAndUpdate(userFilter, userUpdate, {
    new: true,
  });

  // score에 따른 level 산정
  const score = updateUser.user_score[language];
  const level = scoreToLevel(score);

  // level update 쿼리
  const levelUpdate = {
    $set: { ["user_level." + language]: level },
  };

  const updateLevel = await Users.findOneAndUpdate(userFilter, levelUpdate, {
    new: true,
  });

  // update한 객체 response
  return res.status(200).json(updateLevel);
});

/**
 * 레벨테스트 채점
 * "/leveltest/solve?user_id=3&question_id=3&language_id=52" GET Request
 */

function levelTest(level, score) {
  if (level === 1 && score < 5) return 5;
  else if (level === 2 && score < 10) return 10;
  else if (level === 3 && score < 19) return 19;
  else return score;
}

app.get("/leveltest/solve", async (req, res) => {
  const user_id = req.query.user_id;
  const question_id = req.query.question_id;
  const language_id = req.query.language_id;

  const language = idToLanguage(language_id);

  const questionFilter = { problem_id: question_id };
  const userFilter = { user_id: user_id };

  const question = await Questions.findOne(questionFilter);
  const user = await Users.findOne(userFilter);

  // (1)c, cpp, java, python 외의 languageId (2)존재하지 않는 userId (3)존재하지 않는 questionId 입력 받았을 때 error 발생
  if (!language || !user || !question) {
    return res.status(400).json({
      error:
        "존재하지 않는 userId or 존재하지 않는 questionId or 지원하지 않는 언어",
    });
  }

  const question_level = question.problem_level;
  const non_update_score = user.user_score[language];

  const test_score = levelTest(question_level, non_update_score); //

  const userUpdate = {
    ["user_score." + language]: test_score, //
    $push: { user_correct_ques: question_id },
  };

  const updateUser = await Users.findOneAndUpdate(userFilter, userUpdate, {
    new: true,
  });

  const update_score = updateUser.user_score[language];
  const update_level = scoreToLevel(update_score);

  const levelUpdate = {
    $set: { ["user_level." + language]: update_level },
  };

  const updateLevel = await Users.findOneAndUpdate(userFilter, levelUpdate, {
    new: true,
  });

  return res.status(200).json(updateLevel);
});

app.io.on("connection", (socket) => {
  // 소켓

  socket["nickname"] = user.user_nickName; // 초기 닉네임 설정
  clients.set(socket.id, socket);

  console.log("Socket Connected..");

  socket.emit("editor_open");
  socket.emit("level_test", leveltest_questions); // 추가
  console.log(leveltest_questions);

  //기존 방 확인

  socket.on("join_room", async (data) => {
    //서버에서 data안가져와져서 전역으로하기로함. 밑에코드 주석풀경우 전역 지우기
    //let uid = data.user_id;
    //let Lg = data.language;

    socket["uid"] = uid;
    //console.log("lg, uid : ",  Lg, uid);
    let user = await Users.findOne({ user_id: uid });
    //Lv = user.user_level[Lg];

    /*
    const user_correct_ques = user.user_correct_ques;
    console.log("correct que: ", user.user_correct_ques);
    run();
  
    async function run() {
      result = await Questions.aggregate([
        { $match: { problem_level: parseInt(Lv), problem_id: {$nin: user_correct_ques} } },
        { $sample: { size: num_of_ques } },
      ]);
      console.log("lv: ", Lv);
      console.log("prob_id: ", result[0].problem_id , result[1].problem_id);
    }

    
  */

    if (
      rooms.find(
        (room) =>
          room.level === Lv && room.status === "open" && room.language === Lg
      )
    ) {
      // 만들어져 있는 방 중에 자기가 안 푼 문제로 만든 방이 있는지

      // 들어가고자 하는 레벨의 방 존재한다면
      const room = rooms.find(
        (room) =>
          room.level === Lv && room.status === "open" && room.language === Lg
      );
      const roomId = room.roomId;

      socket.join(roomId); // 입장
      socket["room"] = roomId;
      // console.log("B 브라우저 소켓:", room);
      socket
        .to(roomId)
        .emit(
          "new_message",
          `${socket.nickname}가 입장했습니다. 매칭이 완료되었습니다.`
        ); // 상대 브라우저에 자신이 들어왔다는 것을 알림
      socket.emit("new_message", "매칭이 완료되었습니다."); // 자기 자신에게 알림
      socket.emit("roomIdPass", roomId, console.log("Room 입장 : ", roomId));
      socket.to(roomId).emit("welcome", roomId);

      const roomMembers = socket.adapter.rooms.get(roomId); // 방에 있는 유저 목록
      const pairId = Array.from(roomMembers)[0]; // 같은 Rooms에 있는 상대방 id
      const pair = clients.get(pairId); // pairId를 통해 상대 소켓 가져오기

      //코드추가필요 두 소켓 유저가 안푼문제를 제외한 문제 찾기

      let user = await Users.findOne({ user_id: uid });
      let pairuser = await Users.findOne({ user_id: pair["uid"] });

      console.log("user, pairuser, pair[uid]", user, pairuser, pair["uid"]);

      if (get_done) {
        const user_correct_ques = user.user_correct_ques;
        const pairuser_correct_ques = pairuser.user_correct_ques;
        const mix_correct_ques = user_correct_ques.concat(
          pairuser_correct_ques
        );

        console.log("correct que: ", mix_correct_ques);
        run();

        async function run() {
          result = await Questions.aggregate([
            {
              $match: {
                problem_level: parseInt(Lv),
                problem_id: { $nin: mix_correct_ques },
              },
            },
            { $sample: { size: num_of_ques } },
          ]);
          console.log("lv: ", Lv);
          console.log("prob_id: ", result[0].problem_id, result[1].problem_id);

          console.log("test", !socket["problems"], socket["problems"]);
          if (!pair["problems"]) {
            // 재접속시에는 문제그대로
            console.log("문제갱신");
            pair["problems"] = result;
          }
          socket["problems"] = pair["problems"];
          console.log("test2", !socket["problems"], socket["problems"]);
          //socket["problems"] = pair.problems; // 상대의 문제 정보 받아오기 -> 같은 문제를 띄우기 위해 가져옴

          //문제보내기

          socket.emit("test", socket.problems);
          pair.emit("test", pair.problems);
        }
      }

      room.usable -= 1;
      if (room.usable === 0) room.status = "close";
    } else {
      rooms.push({
        // Room 생성
        roomId: roomIndex,
        level: Lv, //사용자 숙련도 레벨
        language: Lg, //프로그래밍 언어
        usable: 2, //방 최대인원
        status: "open", // 방 입장 가능 여부
      });

      socket.join(roomIndex);
      socket["room"] = roomIndex; // 해당 브라우저가 들어간 방 ID 저장
      rooms[rooms.length - 1].usable -= 1;
      socket.emit(
        "roomIdPass",
        roomIndex,
        console.log("Room 생성 : ", roomIndex)
      );

      socket.emit("new_message", "페어가 매칭될 때까지 기다려주세요.");

      roomIndex++;
    }
  });
  socket.on("disconnecting", () => {
    const room = rooms.find((room) => room.roomId === socket.room);
    if (room) {
      socket
        .to(room.roomId)
        .emit("new_message", `${socket.nickname}가 퇴장했습니다.`);
      if (room.usable === 1) {
        rooms.splice(rooms.indexOf(room), 1);
      } else if (room.usable === 0) {
        room.usable += 1;
        room.status = "open";
      }
    }
  });
  socket.on("disconnect", () => {
    clients.delete(socket.id);
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
