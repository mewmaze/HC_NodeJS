const express = require('express');
const router = express.Router();
const { Participant, Challenge } = require('../models');
const authenticateToken = require('./authMiddleware');

// 인증 미들웨어를 사용하는 라우터 설정
router.use(authenticateToken); // 모든 요청에 대해 인증 미들웨어 적용

router.get('/user-challenges', async (req,res) => { //사용자가 가입한 챌린지 목록 가져옴
    try {
        const userId = req.user.id; // 인증된 사용자 ID 사용
        console.log(`Fetching challenges for userId: ${userId}`);

        if (!userId) {
            throw new Error("userId is not defined");
        }
        
        const participants = await Participant.findAll({
            where: {user_id:userId},
            include: [Challenge]
        });

        // Participant 객체들에서 Challenge 객체들만 추출
        const challenges = participants.map(p => ({
            challenge_id: p.Challenge.challenge_id,
            challenge_name: p.Challenge.challenge_name,
            participant_id: p.participant_id, 
        }));

        res.json(challenges);
    } catch(error) {
        console.error('Failed to fetch user challenges:', error);
        res.status(500).json({error: 'Failed to fetch user challenges'});
    }
})

router.post('/', async (req,res) => {
    console.log('실행됨');
    console.log(req.body);
    const {challenge_id, start_date, end_date, progress} = req.body;
    const user_id = req.user.id; 

    try {
        // 이미 해당사용자가 해당 챌린지에 참가했는지 확인
        const existingParticipant = await Participant.findOne({
            where: {
                user_id: user_id,
                challenge_id: challenge_id
            }
        });

        // 이미 참가한경우
        if (existingParticipant) { 
            console.log('이미 해당 챌린지에 참가함');
            return res.status(400).json({ error: '이미 참가한 챌린지입니다.' });
        }

        // Participant 테이블에 참가자 추가
        const newParticipant = await Participant.create({
            user_id: user_id,
            challenge_id: challenge_id,
            start_date,
            end_date,
            progress
        });

        // 해당 챌린지의 participant_count 증가
        const challenge = await Challenge.findByPk(challenge_id);
        if (challenge) {
            await challenge.increment('participant_count');
        }

        res.status(201).json(newParticipant); // 새로운 participant 데이터를 클라이언트에 응답
        console.log(`${user_id}의 참가자가 등록됨`);
    } catch (error) {
        console.error("Failed to add participant:", error);
        res.status(500).json({ error: 'Failed to add participant' });
    }
});

module.exports = router;