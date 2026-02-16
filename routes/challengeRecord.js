const express = require("express");
const router = express.Router();
const {
  ChallengeRecord,
  Challenge,
  Profile,
  Participant,
} = require("../models");
const { updateChallengeStatus } = require("./challengeBadge");
const { Op } = require("sequelize");
const { addDays, startOfDay, endOfDay, format } = require("date-fns");

router.post("/update", async (req, res) => {
  const { participant_id, challenge_id, completion_date } = req.body;

  console.log("Received data:", {
    participant_id,
    challenge_id,
    completion_date,
  });

  try {
    // 챌린지 기록 저장
    const newRecord = await ChallengeRecord.create({
      participant_id,
      challenge_id,
      completion_date,
    });

    console.log("Challenge record created:", newRecord);

    // 챌린지 상태 평가 및 프로필 업데이트
    await updateChallengeStatus(participant_id, challenge_id);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Failed to update challenge record:", error);
    res.status(500).json({ error: "Failed to update challenge record" });
  }
});

// 챌린지 완료 기록 삭제
router.post("/delete", async (req, res) => {
  const { participant_id, challenge_id, completion_date } = req.body;

  console.log("Received DELETE request:", {
    participant_id,
    challenge_id,
    completion_date,
  });

  try {
    await ChallengeRecord.destroy({
      where: {
        participant_id,
        challenge_id,
        completion_date: {
          [Op.eq]: new Date(completion_date),
        },
      },
    });

    // 챌린지 상태 평가 및 프로필 업데이트
    await updateChallengeStatus(participant_id, challenge_id);

    res.status(204).send(); // 성공적으로 삭제된 경우 No Content 상태 코드 반환
  } catch (error) {
    console.error("Failed to delete challenge record:", error);
    res.status(500).json({ error: "Failed to delete challenge record" });
  }
});

// 사용자 ID를 기반으로 챌린지 기록을 가져오는 API 엔드포인트
router.get("/challenge-status", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    // user_id로 participant_id를 조회
    const participants = await Participant.findAll({
      where: { user_id },
    });
    if (participants.length === 0) {
      return res.status(200).json([]); // 참가 중인 챌린지 없음 → 빈 배열 반환
    }
    const participantIds = participants.map((p) => p.participant_id);
    // participant_id로 challengeRecord 조회
    const challengeRecords = await ChallengeRecord.findAll({
      where: { participant_id: participantIds },
    });
    res.json(challengeRecords);
  } catch (error) {
    console.error("Failed to fetch challenge status:", error);
    res.status(500).json({ error: "Failed to fetch challenge status" });
  }
});

module.exports = router;
