import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

export default function NavBar({ isLoggedIn }) {
  const [open, setOpen] = useState("false");
  return (
    <div>
      <nav>
        <div className="logo">CO:WE:DE</div>
        <ul
          className="nav-links"
          style={{ transform: open ? "translateX(0px)" : "" }}
        >
          <li>
            <a>
              <NavLink to={"/"}>HOME</NavLink>
            </a>
          </li>
          <li>
            <a>
              <Link to={"/Guide"}>GUIDE</Link>
            </a>
          </li>
          <li>
            {isLoggedIn ? (
              <a>
                <Link to={"/Matching"}>MATCHING</Link>
              </a>
            ) : (
              <a id="login-btn">
                <Link to={"/LogIn"}>MATCHING</Link>
              </a>
            )}
          </li>
          <li>
            {isLoggedIn ? (
              <a id="login-btn">
                <Link to={"/Mypage"}>My Page</Link>
              </a>
            ) : (
              <a id="login-btn">
                <Link to={"/LogIn"}>LOG IN</Link>
              </a>
            )}
          </li>
        </ul>
        <i className="fas fa-bars burger" onClick={() => setOpen(!open)}></i>
      </nav>
    </div>
  );
}
