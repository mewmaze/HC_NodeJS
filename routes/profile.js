const express = require('express');
const multer = require('multer');
const path = require('path'); // 'path' 모듈 추가
const { User, Profile, Post } = require('../models'); // Adjust according to your ORM and models

const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // 인증 미들웨어 추가

// 사용자와 프로필 정보를 가져오는 API
router.get('/myPage/:user_id', authenticateToken, async (req, res) => {
    console.log('Received request for /myPage/:user_id');
    const user_id = req.params.user_id; // URL 파라미터에서 user_id 추출

    console.log(user_id)
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

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext); // 파일 이름 설정 (여기서는 시간 기반으로 설정)
  },
});

const upload = multer({ storage: storage });

router.put('/update/:user_id', authenticateToken, upload.single('profile_picture'), async (req, res) => {
    const userId = req.params.user_id; // URL 파라미터에서 user_id 추출
  const { nickname, intro } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
      // Check if the profile exists
      const profile = await Profile.findOne({ where: { user_id: userId } });
      if (!profile) {
          return res.status(404).json({ error: 'Profile not found' });
      }

      // Update profile fields
      if (intro) profile.intro = intro;

      // Save updated profile data
      await profile.save();

      // Check if the user exists
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Update user fields
      if (nickname) user.nickname = nickname;
      if (profilePicture) user.profile_picture = profilePicture;

      // Save updated user data
      await user.save();

      // Send back updated profile and user data
      res.json({ user, profile });
  } catch (error) {
      console.error('Failed to update profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 사용자와 작성 글을 가져오는 API
router.get('/myPage/:user_id/getPosts', async (req, res) => {
  console.log('Received request for /myPage/:user_id/getPosts');
  const user_id = req.params.user_id; // URL 파라미터에서 user_id 추출

  console.log(user_id);

  try {
    if (!user_id) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 게시글을 조회합니다.
    const posts = await Post.findAll({
        where: { user_id },
        attributes: ['post_id', 'title', 'content', 'created_at']
    });

    // 게시글 배열을 반환합니다.
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching user and profile data:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 게시글 가져오기
router.get('/myPage/:user_id/:postId', async (req, res) => {
  console.log('Received request for /myPage/:user_id/getPosts');
  const user_id = req.params.user_id; // URL 파라미터에서 user_id 추출
  const { postId } = req.params;

  console.log(user_id);

  try {
    if (!user_id) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    const post = await Post.findOne({ where: { post_id: postId } });
    res.status(200).json(post);
  }
  catch (err) {
    console.error('게시글을 불러오는 데 실패했습니다:', err); 
    res.status(500).send('게시글을 불러오는 데 실패했습니다.');
  }
});

module.exports = router;