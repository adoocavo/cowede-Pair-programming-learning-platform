import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// function LogIn() {
//   const [id, setID] = useState("");
//   const [password, setPassword] = useState("");

//   // const navigate = useNavigate();
//   console.log("로그인!!!!!!!!!!");

//   const submitHandler = () => {
//     const requestOptions = {
//       // 데이터 통신의 방법과 보낼 데이터의 종류, 데이터를 설정합니다.
//       method: "POST", // POST는 서버로 요청을 보내서 응답을 받고, GET은 서버로부터 응답만 받습니다.
//       headers: {
//         "Content-Type": "application/json",
//       }, // json형태의 데이터를 서버로 보냅니다.
//       body: JSON.stringify({
//         // 이 body에 해당하는 데이터를 서버가 받아서 처리합니다.
//         id: id,
//         pw: password,
//       }),
//     };
//     console.log(requestOptions);
//     fetch("http://localhost:3000/login", requestOptions)
//       .then((res) => res.json()) // Result를 JSON으로 받습니다.
//       .then((res) => {
//         console.log(res); // 결과를 console창에 표시합니다.
//         // navigate("/");
//       });
//     //로그인 성공하면 이동하게 수정해야됨
//     // navigate("/Mypage");
//     // navigate("/", { state: { value: 1234 } });
//   };
//   return (
//     <div className="container">
//       <div className="container-login">
//         <div className="wrap-login">
//           <form className="login-form">
//             <span className="login-form-title"> 로그인!!!!!!!!!!!!!! </span>

//             <div className="wrap-input">
//               <input
//                 className={id !== "" ? "has-val input" : "input"}
//                 type="text"
//                 value={id}
//                 onChange={(e) => setID(e.target.value)}
//               />
//               <span className="focus-input" data-placeholder="아이디"></span>
//             </div>

//             <div className="wrap-input">
//               <input
//                 className={password !== "" ? "has-val input" : "input"}
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <span className="focus-input" data-placeholder="비밀번호"></span>
//             </div>

//             <div className="container-login-form-btn">
//               <button
//                 className="login-form-btn"
//                 type="submit"
//                 onSubmit={submitHandler}
//               >
//                 Log In
//               </button>
//             </div>

//             <div className="text-center">
//               <span className="txt1">회원이 아니신가요? </span>
//               <Link to={"/SignIn"} className="txt2">
//                 <p>회원가입</p>
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

function LogIn({ setIsLoggedIn }) {
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
      .then((res) => {
        console.log(res); // 결과를 console창에 표시합니다.
        console.log(res.logInCheck.user_id);
        if (res.logInCheck.user_id !== undefined) {
          navigate("/Mypage");
          setIsLoggedIn(true);
        }
        navigate("/Mypage");
      });
  };

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <div className="login-form">
            <span className="login-form-title"> 로그인 </span>

            <div className="wrap-input">
              <input
                className={id !== "" ? "has-val input" : "input"}
                placeholder="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <span className="focus-input" data-placeholder="아이디"></span>
            </div>
            <div className="wrap-input">
              <input
                className={pw !== "" ? "has-val input" : "input"}
                placeholder="pw"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <span className="focus-input" data-placeholder="비밀번호"></span>
            </div>
            <div className="container-login-form-btn">
              <button
                className="login-form-btn"
                type="submit"
                onClick={onClickLogin}
              >
                Log IN
              </button>
            </div>
            <div className="text-center">
              <span className="txt1">회원이 아니신가요? </span>
              <Link to={"/SignIn"} className="txt2">
                <p>회원가입</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LogIn;
