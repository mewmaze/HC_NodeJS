# HC_NodeJS
프로젝트 데이터베이스 연동 서버

<hr>

### 실행 시 NodeJS의 서버 포트는 3001번 입니다. 주소는 리액트 서버 주소와 동일합니다.
## ./app.js
app.use(cors({
  origin: "http://localhost:3000" })); // React 개발 서버 주소

<hr>

# ./config/config.json
 "development": {
    "username": "root", /* DB 유저 이름 */
    "password": "264811", /* DB 유저 비밀번호 */
    "database": "userdb", /* DB 연동 대상 데이터베이스 */
    "host": "127.0.0.1", /* Mysql 접속 주소 */
    "dialect": "mysql"
  },
