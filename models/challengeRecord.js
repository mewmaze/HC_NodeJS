const {Model, DataTypes} = require("sequelize");

class ChallengeRecord extends Model {
    static init(sequelize) {
        return super.init({
            record_id:{
                type:DataTypes.INTEGER, 
                primaryKey:true, 
                autoIncrement:true,
                allowNull:false
            },
            participant_id:{
                type:DataTypes.INTEGER, 
                allowNull:false,
                references: {
                    model: "Participant",
                    key: "participant_id",
                }
            },
            challenge_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Challenge", // 참조할 모델 이름 (Challenge 테이블)
                    key: "challenge_id", // 참조할 모델의 기본 키 (challenge_id)
                },
            },
            completion_date:{ //챌린지를 수행한 날짜
                type:DataTypes.DATE, 
                allowNull:false
            },
        },{sequelize, modelName:"ChallengeRecord", tableName:"challengeRecord", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(models){
        this.belongsTo(models.Participant, {foreignKey:"participant_id"});
        this.belongsTo(models.Challenge, {foreignKey:"challenge_id"});
    }
}
module.exports = ChallengeRecord;