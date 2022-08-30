import React, { useState } from "react";
import "./Login.css";


function LogIn() {
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> 로그인 </span>
            
            <div className="wrap-input">
              <input
                className={id !== "" ? "has-val input" : "input"}
                type="id"
                value={id}
                onChange={(e) => setID(e.target.value)}
              />
              <span className="focus-input" data-placeholder="아이디"></span>
            </div>

            <div className="wrap-input">
              <input
                className={password !== "" ? "has-val input" : "input"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input" data-placeholder="비밀번호"></span>
            </div>

            <div className="container-login-form-btn">
              <button className="login-form-btn">Log in</button>
            </div>

            <div className="text-center">
              <span className="txt1">회원이 아니신가요? </span>
              <a className="txt2" href="./SignIn">
                회원가입
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LogIn;
