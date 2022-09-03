import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function LogIn() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const onClickLogin = () => {
    console.log("login clicked!");
    const requestOptions = {
      // 데이터 통신의 방법과 보낼 데이터의 종류, 데이터를 설정합니다.
      method: "POST", // POST는 서버로 요청을 보내서 응답을 받고, GET은 서버로부터 응답만 받습니다.
      headers: {
        "Content-Type": "application/json",
      }, // json형태의 데이터를 서버로 보냅니다.
      body: JSON.stringify({
        // 이 body에 해당하는 데이터를 서버가 받아서 처리합니다.
        id: id,
        pw: pw,
      }),
    };
    console.log(requestOptions);
    fetch("http://localhost:3000/login", requestOptions)
      .then((res) => res.json()) // Result를 JSON으로 받습니다.
      .then((req,res) => {
        console.log(res); // 결과를 console창에 표시합니다.
        console.log(res.logInCheck.user_id);
        console.log('이거', req.user);
        navigate("/Mypage");
      });
  };

  return (
    <>
      <div>로그인 ㅋㅋ</div>
      <input
        placeholder="id"
        value={id}
        onChange={(e) => setId(e.target.value)}
      ></input>
      <input
        placeholder="pw"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      ></input>
      <button type="submit" onClick={onClickLogin}>
        login^^
      </button>
      <Link to={"/SignIn"}>
        <p>회원가입</p>
      </Link>
    </>
  );
}
export default LogIn;
