const express = require('express');
const path = require("path");
const multer = require("multer");
const { User, Profile } = require('../models'); // Adjust according to your ORM and models

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be uploaded
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, file.fieldname + '-' + Date.now() + ext); // Create a unique filename
    }
});
  
const upload = multer({ storage });

// 사용자와 프로필 정보를 가져오는 API
router.get('/myPage/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
      if (!user_id) {
          return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
      }

      const user = await User.findByPk(user_id, {
          attributes: ['nickname', 'profile_picture']
      });

      const profile = await Profile.findOne({
          where: { user_id },
          attributes: ['intro', 'achievement_count']
      });

      if (!user || !profile) {
          return res.status(404).json({ error: '사용자 또는 프로필을 찾을 수 없습니다.' });
      }

      res.status(200).json({
          nickname: user.nickname,
          profile_picture: user.profile_picture,
          intro: profile.intro,
          achievement_count: profile.achievement_count
      });
  } catch (error) {
      console.error('Error fetching user and profile data:', error);
      res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 사용자 프로필 업데이트
router.put('/update/:user_id', upload.single('profile_picture'), async (req, res) => {
    const { user_id } = req.params;
    const { nickname, intro } = req.body;
    const profile_picture = req.file ? req.file.filename : null;
  
    try {
        // Fetch the user and profile records
        const user = await User.findByPk(user_id);
        const profile = await Profile.findOne({
            where: { user_id }
        });

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        if (!profile) {
            return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
        }
  
        // Update the user and profile fields
        user.nickname = nickname || user.nickname;
        if (profile_picture) {
            user.profile_picture = profile_picture;
        }

        profile.intro = intro || profile.intro;

        // Save the updated records
        await user.save();
        await profile.save();

        res.status(200).json({
            user: user,
            profile: profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: '프로필 업데이트 실패' });
    }
});

module.exports = router;