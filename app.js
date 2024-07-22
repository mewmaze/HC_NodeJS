require('dotenv').config(); // .env 파일 로드

const express = require('express');
const cors = require('cors');
const path = require("path");
const multer = require('multer');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/auth");
const challengeRoutes = require('./routes/challenge');
const participantRoutes = require('./routes/participant');
const challengeRecordRoutes = require('./routes/challengeRecord');

const {sequelize, User, Profile, Challenge, ChallengeParticipants, ChallengeRecord, Post, Comment } = require('./models');

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000", // React 개발 서버 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Authorization 헤더 허용
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 정적파일 제공을 위한 미들웨어 등록

// Routes
app.use("/auth", authRoutes);
app.use('/challenges',challengeRoutes);
app.use('/participants',participantRoutes);
app.use('/challengerecords',challengeRecordRoutes);

app.get('/users', async(req, res) => {
  try{
      const users = await User.findAll();
      res.json(users);
  } catch (error) {
      res.status(500).json({error: 'Failed to fetch users'});
  }
});

const storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename : function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// diskStorage -> 매번 지워줘야함.. 번거로움
// memoryStorage가 좋다고 함
const upload = multer({ storage: storage });

app.post('/update', upload.single('profile_picture'), async (req, res) => {
  try {
    const { nickname, intro } = req.body;
    const profile_picture = req.file.filename;
    const newProfile = await Profile.create({
      nickname,
      intro,
      profile_picture: `./uploads/${profile_picture}` // Assuming you store the path in the database
    });

    res.json({ success: true, profile: newProfile });
  } catch (error) {
    console.error('프로필 업데이트 실패!', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/uploads/:img', function(req, res) {
  res.sendFile(__dirname + './uploads/' + req.params.img)
});

// Get all profiles
app.get('/getProfile', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await sequelize.sync({ force: true }); // 새로 초기화
    await sequelize.sync({ force: false }); // 데이터베이스 내용 유지
    console.log('Database synced');
});