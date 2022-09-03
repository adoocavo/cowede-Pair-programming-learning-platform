const socket = io();

const muteBtn = document.getElementById("mute");
const micsSelect = document.getElementById("mics");
const call = document.getElementById("call");
const editor = document.getElementById("editor");

// let roomId = 0;

/**
 * 동시편집, 방 만들기
 */

hljs.configure({
  // optionally configure hljs
  languages: ["javascript", "ruby", "python", "cpp"],
});

const quill = new Quill("#editor", {
  modules: {
    syntax: true, // Include syntax module
    toolbar: [["code-block"]], // Include button in toolbar
  },
  theme: "snow",
});

let code = ""; //code

//https://quilljs.com/docs/api/#editor-change
quill.on("editor-change", function (eventName, ...args) {
  //   if (eventName === "text-change") {
  //     // args[0] will be delta
  //     console.log("text-change: ", args[0]);

  let content = quill.getContents(); ///
  console.log("content", content.ops); ///

  code = content.reduce((acc, el) => (acc += el.insert), ""); ///
  console.log("code", code); ///
  //   } else if (eventName === "selection-change") {
  //     // args[0] will be old range
  //     console.log("selection-change: ", args[0]);
  //   }

  //   if (args[2] && args[2] === "user") {
  //     socket.emit("update", {
  //       event: eventName,
  //       delta: args[0],
  //       roomId: roomId,
  //     });
  //   }
});

// socket.on("connect", function () {
//   console.log("connected");
// });

// /*
// socket.emit("userScoreUpdate", {
//   //5, 3, 1 은 test용 실제값넣어줘야함.
//   user_id: 5,
//   problem_id: 3,
//   language: 1,
// });
// */

// socket.on("update", function (data) {
//   const eventName = data.event;
//   const delta = data.delta;
//   if (eventName === "text-change") {
//     quill.updateContents(delta);
//   } else if (eventName === "selection-change") {
//     quill.setSelection(delta.index, delta.length);
//   }
// });

// socket.on("roomIdPass", function (data) {
//   roomId = data;
// });

/**
 * 문제 출력
 */

// leveltest에서는 3문제
let testCases = [
  {
    testCase_input: [],
    testCase_output: [],
  },
  {
    testCase_input: [],
    testCase_output: [],
  },
  {
    testCase_input: [],
    testCase_output: [],
  },
]; //

let problem_ids = [];

socket.on("level_test", (problems) => {
  console.log(problems);

  for (let i = 0; i < 3; i++) {
    // problem_id
    problem_ids.push(problems[i].problem_id);
    console.log("problem_ids:", problem_ids);

    // 제목
    let elProblemTitle = document.querySelector(
      `#question${i}-title > .problem-title`
    );
    elProblemTitle.textContent = problems[i].problem_title;

    // 문제
    let elProblemContent = document.querySelector(
      `#question${i} > .problem-content`
    );

    let content;
    for (let j = 0; j < problems[i].problem_content.length; j++) {
      content = document.createElement("div");
      content.textContent = problems[i].problem_content[j];
      elProblemContent.appendChild(content);
    }

    // 입력
    let elProblemInput = document.querySelector(
      `#question${i} > .problem-input-ex`
    );

    let input;
    for (let j = 0; j < problems[i].problem_input_ex.length; j++) {
      input = document.createElement("div");
      input.textContent = problems[i].problem_input_ex[j];
      elProblemInput.appendChild(input);
    }

    // 출력
    let elProblemOutput = document.querySelector(
      `#question${i} > .problem-output-ex`
    );

    let output;
    for (let j = 0; j < problems[i].problem_output_ex.length; j++) {
      output = document.createElement("div");
      output.textContent = problems[i].problem_output_ex[j];
      elProblemOutput.appendChild(output);
    }

    // 제한사항
    let elRestriction = document.querySelector(`#question${i} > .restriction`);

    let restriction;
    for (let j = 0; j < problems[i].restriction.length; j++) {
      restriction = document.createElement("div");
      restriction.textContent = problems[i].restriction[j];
      elRestriction.appendChild(restriction);
    }

    // 테스트케이스
    testCases[i].testCase_input = problems[i].testCase.testCase_input;
    testCases[i].testCase_output = problems[i].testCase.testCase_output;
  }
  console.log("testCases: ", testCases);
});

///
let questionNum = 0; // 처음엔 0번 문제, 맞히고 다음 문제 누르면 1번 문제

// userId, language, language_id 추출 시작
let userId = "";
let language = "";
let language_id;

let querystring = document.location.href.split("?")[1].split("&");
console.log("querystring~~!!:", querystring); //

userId = querystring[0].split("=")[1];
console.log("userId!!!:", userId); //

language = querystring[1].split("=")[1];
console.log("language~~!!:", language);

if (language === "c") language_id = 50;
else if (language === "cpp") language_id = 52;
else if (language === "java") language_id = 62;
else if (language === "python") language_id = 71;
// userId, language, language_id 추출 끝

// 테스트케이스 실행
function handleClick() {
  console.log("click:", code); //

  //   let language_id = 71; // 50 : C, 52 : C++, 62 : Java, 71 : Python => 선택한 언어로 바뀌게 수정하기

  let source_code = btoa(unescape(encodeURIComponent(code)));
  console.log("source_code(encoded) : ", source_code);

  let stdin;
  let expected_output;

  let elTestcase = document.querySelector(`#testcase${questionNum}`);

  // testcase0 ~ 2 자식으로 li(리스트) element들 이미 있으면 다 제거하기
  if (elTestcase.length !== 0) {
    while (elTestcase.hasChildNodes()) {
      elTestcase.removeChild(elTestcase.firstChild);
    }
  }

  let brk = false;
  for (
    let i = 0;
    i < testCases[questionNum].testCase_input.length && !brk;
    i++
  ) {
    let brk = false;
    stdin = testCases[questionNum].testCase_input[i];
    stdin = btoa(unescape(encodeURIComponent(stdin)));

    expected_output = testCases[questionNum].testCase_output[i];
    expected_output = btoa(unescape(encodeURIComponent(expected_output)));

    let body = `{"language_id":${language_id},"source_code":"${source_code}","stdin":"${stdin}","expected_output":"${expected_output}"}`;
    console.log(body);

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "be6e69c49emshc222e5e72fe2495p19ab96jsn0fb9cff7c37c",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: body,
    };

    fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*",
      // "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=stdin%2Cstdout%2Cstderr%2Cstatus",
      options
    )
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((response) => {
        console.log("response: ", response);

        /*
        if (status의 id가 3(Accepted)이거나 4(Wrong Answer)) 
          if (출력값이 없을 때)  예외 처리
          else {
            if (Wrong Answer)   에러 알려주기 (description). 
            else                아래 코드 실행 (ul에 li가 있으면 지우고 다시 append)
          }
        
        else if (status의 id가 다른 id면)  
        {
          에러 알려주기 (description)
          if (status id가 6(compilation error)) compile_output 보여주기
        }
        */

        if (response.status.id === 3 || response.status.id === 4) {
          // 입력값, 기댓값
          let elTestcaseLi = document.createElement("li");

          let elTestcaseInput = document.createElement("div");
          elTestcaseInput.textContent = `입력값 : ${testCases[questionNum].testCase_input[i]}`;
          elTestcaseLi.appendChild(elTestcaseInput);

          let elTestcaseOutput = document.createElement("div");
          elTestcaseOutput.textContent = `기댓값 : ${testCases[questionNum].testCase_output[i]}`;
          elTestcaseLi.appendChild(elTestcaseOutput);

          let stdout;
          let isEqual;

          if (response.stdout === null) {
            // 출력값이 null입니다.
            stdout = `null. 출력값이 존재하지 않습니다.`;
          } else {
            // 출력값 : XXX
            stdout = decodeURIComponent(escape(window.atob(response.stdout)));
            if (response.status.id === 4) {
              // 기댓값이 출력값과 다릅니다.
              isEqual = false;
            } else if (response.status.id === 3) {
              // 기댓값이 출력값과 같습니다.
              isEqual = true;
            }
          }

          let elStdout = document.createElement("div");
          elStdout.textContent = `출력값 : ${stdout}`;
          elTestcaseLi.appendChild(elStdout);

          let elEqual = document.createElement("div");
          if (response.stdout !== null) {
            if (isEqual) {
              elEqual.textContent = `success : 기댓값과 출력값이 같습니다.`;
            } else {
              elEqual.textContent = `fail : 기댓값과 출력값이 다릅니다.`;
            }
            elTestcaseLi.appendChild(elEqual);
          }

          elTestcase.appendChild(elTestcaseLi);
        } else {
          //
          let errmsg = response.status.description;
          // errmsg 보여주기
          let elDescription = document.createElement("div");
          elDescription.textContent = errmsg;
          elTestcase.appendChild(elDescription);
          brk = true;
          return;
        }
      })
      .catch((err) => console.error(err));
    if (brk) {
      break;
    }
  }
}

const submission = document.getElementById("submission");
submission.addEventListener("click", handleClick);

const realSubmission = document.getElementById("realsubmission");
realSubmission.addEventListener("click", handleClickSubmit);

const one = document.getElementById("one");
one.addEventListener("click", handleClickNum);

const two = document.getElementById("two");
two.addEventListener("click", handleClickNum);

const three = document.getElementById("three");
three.addEventListener("click", handleClickNum);

const exit = document.getElementById("exit");
exit.addEventListener("click", handleClickExit);

function handleClickNum(e) {
  questionNum = e.target.value;
  console.log("questionNum:", questionNum); //

  let hideNum1 = (questionNum + 1) % 3;
  let hideNum2 = (questionNum + 2) % 3;

  // nav에 뜨는 제목
  let nowQuestionTitle = document.querySelector(
    `#question${questionNum}-title`
  );
  // if (nowQuestionTitle.classList.contains("hidden"))
  nowQuestionTitle.classList.remove("hidden"); // 현재 문제 보여주기

  let hideQuestionTitle1 = document.querySelector(`#question${hideNum1}-title`);
  let hideQuestionTitle2 = document.querySelector(`#question${hideNum2}-title`);

  console.log("hideNum1, hideNum2:", hideNum1, hideNum2);
  console.log("#question${hideNum1}-title:", `#question${hideNum1}-title`);
  console.log("hideQuestionTitle1", hideQuestionTitle1);
  //   console.log("hidden?", hideQuestionTitle1.classList.contains("hidden"));
  // if (!hideQuestionTitle1.classList.contains("hidden"))
  hideQuestionTitle1.classList.add("hidden");
  // if (!hideQuestionTitle2.classList.contains("hidden"))
  hideQuestionTitle2.classList.add("hidden");

  // main에 뜨는 문제
  let nowQuestion = document.querySelector(`#question${questionNum}`);
  // if (nowQuestion.classList.contains("hidden"))
  nowQuestion.classList.remove("hidden");

  let hideQuestion1 = document.querySelector(`#question${hideNum1}`);
  let hideQuestion2 = document.querySelector(`#question${hideNum2}`);

  // if (!hideQuestion1.classList.contains("hidden"))
  hideQuestion1.classList.add("hidden");
  // if (!hideQuestion2.classList.contains("hidden"))
  hideQuestion2.classList.add("hidden");

  // testcase
  let nowTestcase = document.querySelector(`#testcase${questionNum}`);
  // if (nowTestcase.classList.contains("hidden"))
  nowTestcase.classList.remove("hidden");

  let hideTestcase1 = document.querySelector(`#testcase${hideNum1}`);
  let hideTestcase2 = document.querySelector(`#testcase${hideNum2}`);

  // if (!hideTestcase1.classList.contains("hidden"))
  hideTestcase1.classList.add("hidden");
  // if (!hideTestcase2.classList.contains("hidden"))
  hideTestcase2.classList.add("hidden");

  ///
  //   let elQuestion0Title = document.querySelector("#question0-title");//
  //   elQuestion0Title.classList.add("hidden");//

  //   let elQuestion1Title = document.querySelector("#question1-title");//
  //   elQuestion1Title.classList.remove("hidden");//

  //   let elTestcase0 = document.querySelector("#testcase0");//
  //   elTestcase0.classList.add("hidden");//

  //   let elTestcase1 = document.querySelector("#testcase1");//
  //   elTestcase1.classList.remove("hidden");//

  //   let elQuestion0 = document.querySelector("#question0");//
  //   elQuestion0.classList.add("hidden");//

  //   let elQuestion1 = document.querySelector("#question1");//
  //   elQuestion1.classList.remove("hidden");//
}

function handleClickSubmit() {
  let source_code = btoa(unescape(encodeURIComponent(code)));
  console.log("source_code(encoded) : ", source_code);
  let correct = true;

  let stdin;
  let expected_output;

  let elTestcase = document.querySelector(`#testcase${questionNum}`);

  // testcase0 or 1 자식으로 li(리스트) element들 이미 있으면 다 제거하기
  if (elTestcase.length !== 0) {
    while (elTestcase.hasChildNodes()) {
      elTestcase.removeChild(elTestcase.firstChild);
    }
  }

  let brk = false;
  for (
    let i = 0;
    i < testCases[questionNum].testCase_input.length && !brk;
    i++
  ) {
    let brk = false;
    stdin = testCases[questionNum].testCase_input[i];
    stdin = btoa(unescape(encodeURIComponent(stdin)));

    expected_output = testCases[questionNum].testCase_output[i];
    expected_output = btoa(unescape(encodeURIComponent(expected_output)));

    let body = `{"language_id":${language_id},"source_code":"${source_code}","stdin":"${stdin}","expected_output":"${expected_output}"}`;
    console.log(body);

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "be6e69c49emshc222e5e72fe2495p19ab96jsn0fb9cff7c37c",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: body,
    };

    fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*",
      options
    )
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((response) => {
        console.log("response: ", response);

        if (response.status.id === 3 || response.status.id === 4) {
          // 입력값, 기댓값
          let elTestcaseLi = document.createElement("li");

          let elTestcaseInput = document.createElement("div");
          elTestcaseInput.textContent = `입력값 : ${testCases[questionNum].testCase_input[i]}`;
          elTestcaseLi.appendChild(elTestcaseInput);

          let elTestcaseOutput = document.createElement("div");
          elTestcaseOutput.textContent = `기댓값 : ${testCases[questionNum].testCase_output[i]}`;
          elTestcaseLi.appendChild(elTestcaseOutput);

          let stdout;
          let isEqual;

          if (response.stdout === null) {
            // 출력값이 null입니다.
            stdout = `null. 출력값이 존재하지 않습니다.`;
            correct = false;
          } else {
            // 출력값 : XXX
            stdout = decodeURIComponent(escape(window.atob(response.stdout)));
            if (response.status.id === 4) {
              // 기댓값이 출력값과 다릅니다.
              isEqual = false;
              correct = false;
            } else if (response.status.id === 3) {
              // 기댓값이 출력값과 같습니다.
              isEqual = true;
              // correct += 1;
              if (i === testCases[questionNum].testCase_input.length - 1) {
                if (correct) {
                  fetch(
                    `http://localhost:3000/leveltest/solve?user_id=${userId}&question_id=${problem_ids[questionNum]}&language_id=${language_id}`
                  )
                    .then((response) => response.json())
                    .then((response) => {
                      console.log(
                        `http://localhost:3000/leveltest/solve?user_id=${userId}&question_id=${problem_ids[questionNum]}&language_id=${language_id}`
                      );
                      console.log("***leveltest response***:", response);
                      alert("정답입니다.");
                    });
                } else {
                  console.log(
                    "testCases[questionNum].testCase_input.length:",
                    testCases[questionNum].testCase_input.length
                  );
                  console.log("correct:", correct);
                  alert("틀렸습니다.");
                }
              }
            }
          }

          let elStdout = document.createElement("div");
          elStdout.textContent = `출력값 : ${stdout}`;
          elTestcaseLi.appendChild(elStdout);

          let elEqual = document.createElement("div");
          if (response.stdout !== null) {
            if (isEqual) {
              elEqual.textContent = `success : 기댓값과 출력값이 같습니다.`;
            } else {
              elEqual.textContent = `fail : 기댓값과 출력값이 다릅니다.`;
            }
            elTestcaseLi.appendChild(elEqual);
          }

          elTestcase.appendChild(elTestcaseLi);
        } else {
          //
          let errmsg = response.status.description;
          // errmsg 보여주기
          let elDescription = document.createElement("div");
          elDescription.textContent = errmsg;
          elTestcase.appendChild(elDescription);
          brk = true;
          return;
        }
      })
      .catch((err) => console.error(err));
    if (brk) {
      break;
    }
  }
  // 모든 테스트케이스 통과할 경우만 problem_id, userId, language_id 보내기
  // else {
  //   alert("틀렸습니다.");
  // }
  // console.log(
  //   `http://localhost:3000/editor/solve?user_id=${userId}&question_id=${problem_id}&language_id=${language_id}`
  // );
}

function handleClickExit() {
  window.open(`http://localhost:3000`, "_self");
}
