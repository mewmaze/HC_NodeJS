const express = require('express');
const router = express.Router();
const multer = require('multer'); //파일처리를 위한 multer 미들웨어 
const path = require('path');
const { Challenge } = require('../models');

//파일 업로드를 위한 multer설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads'); // 파일이 저장될 경로 설정
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + ext); // 파일 이름 설정 (여기서는 시간 기반으로 설정)
    }
  });
  
const upload = multer({ storage: storage });


router.route('/challenges')
    .get(async (req,res) => { 
        try {
            const challenges = await Challenge.findAll(); 
            res.json(challenges); 
        } catch (error) { //오류
            res.status(500).json({ error: 'Failed to fetch challenges'}); 
        }
    })


    .post(upload.single('challenge_img'), async (req, res) => {
        try {
          const { challenge_name, description, target_days, participant_count } = req.body;
          const challenge = await Challenge.create({
            challenge_name,
            description,
            target_days,
            participant_count,
            challenge_img: req.file ? req.file.path : null 
          });
          res.status(201).json(challenge);
        } catch (error) {
          console.error("Failed to create challenge:", error);
          res.status(500).json({ error: 'Failed to create challenge' });
        }
      });
    
// 특정 challenge_id에 대한 GET 요청 
router.get('/:challenge_id', async (req, res) => {
    try {
        const challenge = await Challenge.findByPk(req.params.challenge_id);
        if (challenge) {
            res.json(challenge);
        } else {
            res.status(404).json({ error: '챌린지를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error("Failed to fetch challenge:", error);
        res.status(500).json({ error: '챌린지를 가져오는 데 실패했습니다.' });
    }
});



module.exports = router;