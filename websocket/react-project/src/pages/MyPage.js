import React from "react";
import { Link } from "react-router-dom";
import "./Mypage.css";
import { useState, useEffect } from "react";

function Mypage() {
  //let requestRsponse = fetch(url, [params]);
  const [userInformation, setUserInformation] = useState({});

  useEffect(() => {
    fetch("http://localhost:3000/mypage")
      .then((res) => res.json()) // Result를 JSON으로 받습니다.
      .then((res) => {
        console.log(res); // 결과를 console창에 표시합니다.
        setUserInformation(res.userSession);
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
              {/* <div className="userInfo">{`Java: ${userInformation.user_level.java}`}</div>
              <div className="userInfo">{`C: ${userInformation.user_level.c}`}</div>
              <div className="userInfo">{`C++: ${userInformation.user_level.cpp}`}</div>
              <div className="userInfo">{`Python: ${userInformation.user_level.python}`}</div> */}
            </div>
            <div className="wrap-info">
              <span className="info">스코어</span>
              <span className="userInfo">score</span>
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
