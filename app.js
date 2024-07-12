const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/auth");
const path = require("path");
const {sequelize, User, Profile, Challenge, ChallengeParticipants, ChallengeRecord, Post, Comment } = require('./models');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000", // React 개발 서버 주소
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.get('/users', async(req, res) => {
    try{
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch users'});
    }
});

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await sequelize.sync({ force: true }); // 새로 초기화
    await sequelize.sync({ force: false }); // 데이터베이스 내용 유지
    console.log('Database synced');
  });