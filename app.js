require('dotenv').config(); // .env 파일 로드

const express = require('express');
const cors = require('cors');
const path = require("path");

const multer = require('multer');
const bodyParser = require('body-parser');

const authRoutes = require("./routes/auth");
const challengeRoutes = require('./routes/challenge');
const participantRoutes = require('./routes/participant');
const postRoutes = require('./routes/post');
const profileRoutes = require('./routes/profile');
const challengeRecordRoutes = require('./routes/challengeRecord');

const {sequelize, User, Profile, Challenge, ChallengeParticipants, ChallengeRecord, Post, Comment } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000", // React 개발 서버 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Authorization 헤더 허용
}));

const storage = multer.diskStorage({
  destination : function(req, file, cb) {//파일이 저장될 디렉토리 경로를 설정
    cb(null, 'uploads/');
  },
  filename : function(req, file, cb) { //저장될 파일의 이름을 설정
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// diskStorage -> 매번 지워줘야함.. 번거로움
// memoryStorage가 좋다고 함
const upload = multer({ storage: storage });  //파일 업로드 미들웨어

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 정적파일 제공을 위한 미들웨어 등록

// Routes
app.use("/auth", authRoutes);
app.use("/api", profileRoutes);
app.use('/challenges',challengeRoutes);
app.use('/participants',participantRoutes);
app.use('/challengerecords',challengeRecordRoutes);
app.use('/posts', postRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/users', async(req, res) => {
  try{
      const users = await User.findAll();
      res.json(users);
  } catch (error) {
      res.status(500).json({error: 'Failed to fetch users'});
  }
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await sequelize.sync({ force: true }); // 새로 초기화
    await sequelize.sync({ force: false }); // 데이터베이스 내용 유지
    console.log('Database synced');
});
