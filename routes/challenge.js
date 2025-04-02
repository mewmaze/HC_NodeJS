const express = require("express");
const router = express.Router();
const multer = require("multer"); //파일처리를 위한 multer 미들웨어
const path = require("path");
const fs = require("fs");
const { Challenge } = require("../models");

// uploads 디렉토리를 정적 파일로 제공
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  //'uploads'폴더가 있는지 확인 후에 없으면 생성
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext); // 파일 이름 설정 (여기서는 시간 기반으로 설정)
  },
});

const upload = multer({ storage: storage });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const challenges = await Challenge.findAll();

      const baseURL = "http://localhost:5000/uploads/";
      const challengesImg = challenges.map((challenge) => {
        if (challenge.challenge_img) {
          challenge.challenge_img = `${baseURL}${challenge.challenge_img}`;
        }
        return challenge;
      });
      res.json(challengesImg);
    } catch (error) {
      //오류
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  })

  .post(upload.single("challenge_img"), async (req, res) => {
    try {
      const {
        challenge_name,
        description,
        target_period,
        target_days,
        participant_count,
        start_date,
        end_date,
      } = req.body;
      const challenge = await Challenge.create({
        challenge_name,
        description,
        target_period,
        target_days,
        participant_count,
        challenge_img: req.file ? req.file.filename : null, // 파일명만 저장
        start_date: start_date,
        end_date: end_date,
      });
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Failed to create challenge:", error);
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });

// 특정 challenge_id에 대한 GET 요청
router.get("/:challenge_id", async (req, res) => {
  try {
    console.log("Fetching challenge with ID:", req.params.challenge_id);
    const challenge = await Challenge.findByPk(req.params.challenge_id);
    if (challenge) {
      const baseURL = "http://localhost:5000/uploads/";
      if (challenge.challenge_img) {
        challenge.challenge_img = `${baseURL}${challenge.challenge_img}`;
      }
      res.json(challenge);
    } else {
      res.status(404).json({ error: "챌린지를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error("Failed to fetch challenge:", error);
    res.status(500).json({ error: "챌린지를 가져오는 데 실패했습니다." });
  }
});

module.exports = router;
