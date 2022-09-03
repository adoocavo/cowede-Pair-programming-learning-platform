import React from "react";
import { Link } from "react-router-dom";
import "./Mypage.css";
import { useState, useEffect } from "react";

function Mypage() {
  //let requestRsponse = fetch(url, [params]);
  const [userInformation, setUserInformation] = useState({});
  const [level, setLevel] = useState([]);
  const [score, setScore] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/mypage")
      .then((res) => res.json()) // Result를 JSON으로 받습니다.
      .then((res) => {
        console.log(res); // 결과를 console창에 표시합니다.
        setUserInformation(res.userSession);
        console.log(res.userSession.user_level.java);
        setLevel([
          res.userSession.user_level.java,
          res.userSession.user_level.c,
          res.userSession.user_level.cpp,
          res.userSession.user_level.python,
        ]);
        setScore([
          res.userSession.user_score.java,
          res.userSession.user_score.c,
          res.userSession.user_score.cpp,
          res.userSession.user_score.python,
        ]);
      });
  }, []);
  return (
    <div className="container">
      <div className="container-mypage">
        <div className="wrap-mypage">
          <div className="mypage">
            <span className="mypage-title"> 내정보 </span>
            <div className="wrap-info">
              <span className="info">닉네임</span>
              <span className="userInfo">{userInformation.user_nickName}</span>
            </div>
            <div className="wrap-info">
              <span className="info">아이디</span>
              <span className="userInfo">{userInformation.user_id}</span>
            </div>
            <div className="wrap-info">
              <span className="info">이메일</span>
              <span className="userInfo">{userInformation.user_email}</span>
            </div>
            <div className="wrap-info">
              <span className="info">레벨</span>
              <span className="userInfo">{`Java: ${level[0]} / C: ${level[1]} / C++: ${level[2]} / Python: ${level[3]}`}</span>
              {/* <span className="userInfo">{`C: ${level[1]}`}</span>
              <span className="userInfo">{`C++: ${level[2]}`}</span>
              <span className="userInfo">{`Python: ${level[3]}`}</span> */}
            </div>
            <div className="wrap-info">
              <span className="info">스코어</span>
              {/* <span className="userInfo">score</span> */}
              <span className="userInfo">{`Java: ${score[0]} / C: ${score[1]} / C++: ${score[2]} / Python: ${score[3]}`}</span>
            </div>
            <div className="text-center">
              <span className="txt1">Welcome! 오늘도 반갑습니다. </span>
              <Link to={"/Home"} className="txt2">
                <p>홈화면으로</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Mypage;

/*
<!-- <%= userSession.user_id %> 님의 -->

            <div>
              <script>
                async function funcRequest(url){
                  await fetch(url)
                  .then((response) => {
                    return response.json(); // data into json
                  }).then((data) => {
                    // Here we can use the response Data
                  }).catch(function(error) {
                    console.log(error);
                  })
                }
                const url = 'URL of file';
                funcRequest(url);
              </script>
            </div>
*/
