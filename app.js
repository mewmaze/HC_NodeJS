require("dotenv").config(); // .env 파일 로드

const express = require("express");
const cors = require("cors");
const path = require("path");

const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const challengeRoutes = require("./routes/challenge");
const participantRoutes = require("./routes/participant");
const postRoutes = require("./routes/post");
const profileRoutes = require("./routes/profile");
const challengeRecordRoutes = require("./routes/challengeRecord");
const userRoutes = require("./routes/user");

const {
  sequelize,
  User,
  Profile,
  Challenge,
  ChallengeParticipants,
  ChallengeRecord,
  Post,
  Comment,
} = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // React 개발 서버 주소
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Authorization 헤더 허용
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //파일이 저장될 디렉토리 경로를 설정
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    //저장될 파일의 이름을 설정
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// diskStorage -> 매번 지워줘야함.. 번거로움
// memoryStorage가 좋다고 함
const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 정적파일 제공을 위한 미들웨어 등록

// Routes
app.use("/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/challenges", challengeRoutes);
app.use("/participants", participantRoutes);
app.use("/challengerecords", challengeRecordRoutes);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const initializeDatabase = async () => {
  try {
    // 기본 사용자 데이터 삽입
    const defaultUserPath = path.join(__dirname, "defaultUsers.json");
    const defaultUsers = JSON.parse(fs.readFileSync(defaultUserPath, "utf8"));

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      if (!existingUser) {
        await User.create(userData);
      }
    }
    console.log("Database initialized with default user data");

    // 기본 프로필 데이터 삽입
    const defaultProfilePath = path.join(__dirname, "defaultProfiles.json");
    const defaultProfiles = JSON.parse(
      fs.readFileSync(defaultProfilePath, "utf8")
    );

    for (const profileData of defaultProfiles) {
      const existingProfile = await Profile.findOne({
        where: { user_id: profileData.user_id },
      });
      if (!existingProfile) {
        await Profile.create(profileData);
      }
      console.log(
        `Profile for user_id ${profileData.user_id} created or already exists`
      );
    }
    console.log("Database initialized with default profile data");

    // 기본 챌린지 데이터 삽입
    const defaultChallengePath = path.join(__dirname, "defaultChallenge.json");
    const defaultChallenges = JSON.parse(
      fs.readFileSync(defaultChallengePath, "utf8")
    );

    for (const challengeData of defaultChallenges) {
      const existingChallenge = await Challenge.findOne({
        where: { challenge_name: challengeData.challenge_name },
      });
      if (!existingChallenge) {
        // 챌린지 이미지 경로 설정
        if (challengeData.challenge_img) {
          challengeData.challenge_img = challengeData.challenge_img;
        }
        await Challenge.create(challengeData); // 기본 챌린지 데이터 삽입
      }
    }
    console.log("Database initialized with default challenge data");

    // 기본 게시글 데이터 삽입
    const defaultPostPath = path.join(__dirname, "defaultPosts.json");
    const defaultPosts = JSON.parse(fs.readFileSync(defaultPostPath, "utf8"));

    for (const postData of defaultPosts) {
      const existingPost = await Post.findOne({
        where: { title: postData.title, user_id: postData.user_id },
      });
      if (!existingPost) {
        await Post.create(postData);
      }
    }
    console.log("Database initialized with default post data");

    // 기본 댓글 데이터 삽입
    const defaultCommentPath = path.join(__dirname, "defaultComments.json");
    const defaultComments = JSON.parse(
      fs.readFileSync(defaultCommentPath, "utf8")
    );

    for (const commentData of defaultComments) {
      const existingComment = await Comment.findOne({
        where: {
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          content: commentData.content,
        },
      });
      if (!existingComment) {
        await Comment.create(commentData);
      }
    }
    console.log("Database initialized with default comment data");
  } catch (error) {
    console.error(
      "Error initializing database with default comment data:",
      error
    );
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  //await sequelize.sync({ force: true }); // 새로 초기화
  await sequelize.sync({ force: false }); // 데이터베이스 내용 유지
  await initializeDatabase();
  console.log("Database synced");
});
