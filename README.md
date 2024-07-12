# HC_NodeJS
프로젝트 데이터베이스 연동 서버

<hr>

### 실행 시 NodeJS의 서버 포트는 3001번 입니다. 주소는 리액트 서버 주소와 동일합니다.

<hr>

## ./package.json, ./package-lock.json 따로 설치해야함 -> 덮어쓰지 않기
#### 먼저 프로젝트 폴더 만들고 하시거나 다음 코드와 같이 하기

    "name": "db_restapi_nodejs", // 이 부분 바꾸셔야 해용! 아니면 이 이름에 맞춰서 폴더 이름 설정하기
      "version": "1.0.0",
      "main": "app.js",          // 현재 프로젝트 폴더의 main에 app.js가 있으면 OK, index.js이면 수정 필요!
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "nodemon app"
      },

<hr>

## ./app.js
app.use(cors({

    origin: "http://localhost:3000" // React 개발 서버 주소
  
}));

<hr>

### 이 부분 수정 권유합니다. (환경 설정 맞춤 필요)
## ./config/config.json
"development": {

    "username": "root", /* DB 유저 이름 */
    
    "password": "264811", /* DB 유저 비밀번호 */
    
    "database": "userdb", /* DB 연동 대상 데이터베이스 */
    
    "host": "127.0.0.1", /* Mysql 접속 주소 */
    
    "dialect": "mysql"
    
},
