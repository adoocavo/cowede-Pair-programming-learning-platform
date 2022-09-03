import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Matching from "./pages/Matching";
import Guide from "./pages/Guide";
import SignIn from "./pages/SignIn";
import LogIn from "./pages/LogIn";
import Mypage from "./pages/MyPage";
import Navbar from "./components/Navbar";
import LevelTest from "./pages/LevelTest";
import { useState } from "react";

/*
 라이브러리의 BrowserRouter, Routes, Route 컴포넌트를 사용해 
 url 을 통해 페이지 이동 할 수 있게 
 즉, 컴포넌트가 페이지 역할을 할 수 있도록 설정해 준다.

 브라우저의 url이 바뀌면 컴포넌트를 렌더링해서 걔가 페이지 역할을 하도록 라우팅
*/

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/Matching" element={<Matching userId={userId} />} />
        <Route path="/Guide" element={<Guide />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route
          path="/LogIn"
          element={
            <LogIn setIsLoggedIn={setIsLoggedIn} setUserId={setUserId} />
          }
        />
        <Route path="/Mypage" element={<Mypage />} />
        <Route path="/LevelTest" element={<LevelTest userId={userId} />} />
      </Routes>
    </div>
  );
}

export default App;
