/**
 * 브라우져로 코위드에 접속 -> 세션 생성 후 해당 세션의 세션id를 쿠키로 구워서 준다
 * 
 * 브라우져는 그 쿠키를 받아서 로컬에 저장하고 다시 접솔할때 requeset에 항상 쿠키가 포함되어서 
 * 서버는 쿠키를 받고 쿠키에 저장된 세션 id로 브라우져를 구분
 * 
 * 세션은 서버 종료, 특정시간 지났을때, 로그아웃시에 삭제됨
 * 
 * 
 *로그인 요청 -> 로그인 성공시에 사용자의 식별 정보를 저장하고 {
    1. passport.use(new LocalStrategy( 에서 userInfo에 저장 후 
    
    2. passport.serializeUser 함수에서 이미 저장된(세션 스토어에 존재하는)
     브라우져 세션에 회원 식별정보가 담긴 userInfo저장
    
     3. 로그인 이후 코위드에 접속할때마다 passport.deserializeUser 함수에서
     세션 식별정보(passport.serializeUser 함수에서 받은 user.user_id로 )
     를 세션 스토어에서 꺼내와서 해당되는 유저의 DB Document를 꺼내서 req.user객체에 박아둔다.
     => 브라우져로부터 오는 모든 요청에 req.use가 있는것 (login_check에는 없는 이유가 
        브라우져에서 직접 한 요청이 아니라서???))
 * }

    ??sessionId가 담긴 쿠키는 한게??
    즉, 서버의 세션객체에 회원 정보가 저장되고 해당 새션의 sessionId가 브라우져에 쿠키로 보내진다
    

 * 
 * //data and salt arguments required
 * 
 * //로그인
 * user.comparePassword(input_pw, user.user_pw, (err, isMatch) //254라인
 * // input_pw가 undefined
 * 
 * //회원가입
 *  new_user.user_pw = await bcrypt.hash(input_pw, salt); //136라인
 *  // input_pw가 undefined
 * 
 */