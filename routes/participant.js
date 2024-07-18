const express = require('express');
const router = express.Router();
const { Participant, Challenge } = require('../models');

router.post('/', async (req,res) => {
    console.log('실행됨');
    console.log(req.body);
    const {user_id, challenge_id, start_date, end_date, progress} = req.body;

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
        console.error("Failed to add participant:". error);
        res.status(500).json({ error: 'Failed to add participant' });
    }
});

module.exports = router;