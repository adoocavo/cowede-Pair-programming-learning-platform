import React from "react";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 40px 20px;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 1000px;
  header {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
  }
  h1 {
    font-size: 25px;
  }
  h3 {
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    margin-top: 10px;
    line-height: 1.5;
  }
  p {
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.5;
  }
  input {
    font-size: 16px;
    text-decoration: none;
    padding: 5px 10px;
    margin: 4px;
  }
  select {
    font-size: 16px;
    text-decoration: none;
    padding: 5px 10px;
    margin: 4px;
  }
  button {
    color: #fff;
    font-size: 15px;
    text-decoration: none;
    background-color: #268fe1;
    padding: 6px 10px;
    border: 0;
    border-radius: 8px;
    display: inline-block;
  }
`;

const LevelTest = ({ userId }) => {
  //   console.log("LevelTest...");
  const [language, setLanguage] = useState("c");
  // const [userid, setUserid] = useState("");

  const languageOptions = [
    { value: "c", name: "C" },
    { value: "cpp", name: "C++" },
    { value: "java", name: "Java" },
    { value: "python", name: "Python" },
  ];

  const onChangeLanguage = (e) => {
    setLanguage(e.target.value);
  };
  // const onChangeUserid = (e) => {
  //   setUserid(e.target.value);
  // };

  const SelectBox = (props) => {
    return (
      <select onChange={onChangeLanguage} value={language}>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    );
  };

  // const [loading, setLoading] = useState(null);
  const onClickTest = () => {
    // 매칭 누르면 먼저 로딩중 띄우고, 매칭되면 페이지 이동하게 수정하고싶음..
    window.open(
      `http://52.52.250.134:3000/leveltest?user_id=${userId}&language=${language}`, // 테스트케이스 url로 수정하기
      "_blank"
    );
  };
  return (
    <>
      <Container>
        <Wrapper>
          <h1>레벨 테스트</h1>
          <p>언어를 선택하세요</p>
          <SelectBox options={languageOptions}></SelectBox>
          {/* <p>user_id를 입력하세요 (임시)</p>
          <input placeholder="user_id" onChange={onChangeUserid}></input> */}
          <button onClick={onClickTest}>테스트 시작</button>
        </Wrapper>
      </Container>
    </>
  );
};

export default LevelTest;
