const express = require('express');
const router = express.Router();
const { ChallengeRecord } = require('../models');

router.post('/update', async (req,res) => {
    const {participant_id, challenge_id, completion_date} = req.body;

    console.log('Received data:', { participant_id, challenge_id, completion_date });

    try{
        const newRecord = await ChallengeRecord.create({
            participant_id,
            challenge_id,
            completion_date
        });

        res.status(201).json(newRecord);
    } catch(error) {
        console.error('Failed to update challenge record:', error);
        res.status(500).json({ error: 'Failed to update challenge record'});
    }
});

// 챌린지 완료 기록 삭제
router.post('/delete', async (req, res) => {
    const { participant_id, challenge_id, completion_date } = req.body;

    try {
        await ChallengeRecord.destroy({
            where: {
                participant_id,
                challenge_id,
                completion_date
            }
        });

        res.status(204).send(); // 성공적으로 삭제된 경우 No Content 상태 코드 반환
    } catch (error) {
        console.error('Failed to delete challenge record:', error);
        res.status(500).json({ error: 'Failed to delete challenge record' });
    }
});

router.get('/challenge-status',async (req,res) => {
    const {date} = req.query;

    try{
        const challengeRecords = await ChallengeRecord.findAll({
            where: {
                completion_date: date
            }
        });

        res.json(challengeRecords);
    } catch(error) {
        console.error('Failed to fetch challenge status:', error);
        res.status(500).json({ error: 'Failed to fetch challenge status'});
    }
});

module.exports = router;