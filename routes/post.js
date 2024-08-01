const express = require('express');
const Post = require('../models/post');
const { Comment } = require('../models');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// 모든 게시글 가져오기 (커뮤니티 ID로 필터링)
router.get('/', async (req, res) => {
  const { communityId } = req.query; // 쿼리 파라미터에서 커뮤니티 ID 가져오기

  try {
    const whereClause = communityId ? { community_id: communityId } : {};
    const posts = await Post.findAll({ where: whereClause });
    res.status(200).json(posts);
  } catch (err) {
    console.error('게시글을 불러오는 데 실패했습니다:', err);
    res.status(500).send('게시글을 불러오는 데 실패했습니다.');
  }
});

// 특정 게시글 가져오기
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error('게시글을 불러오는 데 실패했습니다:', err);
    res.status(500).send('게시글을 불러오는 데 실패했습니다.');
  }
});

// 게시글 작성
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, community_id } = req.body; // 커뮤니티 ID도 함께 받아옴
  const user_id = req.user.id;

  try {
    const post = await Post.create({ title, content, user_id, community_id });
    res.status(201).json(post);
  } catch (err) {
    console.error('게시글 작성에 실패했습니다:', err);
    res.status(500).send('게시글 작성에 실패했습니다.');
  }
});

// 게시글 수정
router.put('/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    post.title = title;
    post.content = content;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('게시글 수정에 실패했습니다:', err);
    res.status(500).send('게시글 수정에 실패했습니다.');
  }
});

// 게시글 삭제
router.delete('/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    await post.destroy();
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error('게시글 삭제에 실패했습니다:', err);
    res.status(500).send('게시글 삭제에 실패했습니다.');
  }
});

// 특정 게시글의 댓글 가져오기
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.findAll({ where: { post_id: postId } });
    res.status(200).json(comments);
  } catch (err) {
    console.error('댓글을 불러오는 데 실패했습니다:', err);
    res.status(500).send('댓글을 불러오는 데 실패했습니다.');
  }
});

// 댓글 작성
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const user_id = req.user.id;

  try {
    const comment = await Comment.create({ post_id: postId, user_id, content });
    res.status(201).json(comment);
  } catch (err) {
    console.error('댓글 작성에 실패했습니다:', err);
    res.status(500).send('댓글 작성에 실패했습니다.');
  }
});

module.exports = router;
