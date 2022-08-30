import React, { useState } from "react";
import "./Signin.css";

function SignIn() {
  const [nickname, setNickname] = useState("");
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> 회원가입 </span>
            <div className="wrap-input">
              <input
                className={nickname !== "" ? "has-val input" : "input"}
                type="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <span className="focus-input" data-placeholder="닉네임"></span>
            </div>
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

            <div className="wrap-input">
              <input
                className={confirmpassword !== "" ? "has-val input" : "input"}
                type="confirmpassword"
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="focus-input" data-placeholder="비밀번호 확인"></span>
            </div>

            <div className="container-login-form-btn">
              <button className="login-form-btn">Sign in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default SignIn;
