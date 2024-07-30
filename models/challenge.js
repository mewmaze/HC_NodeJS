const {Model, DataTypes} = require("sequelize");

class Challenge extends Model {
    static init(sequelize) {
        return super.init({
            challenge_id:{
                type:DataTypes.INTEGER, 
                primaryKey:true, 
                autoIncrement:true
            },
            challenge_name:{
                type:DataTypes.STRING(255), 
                allowNull:false
            },
            description:{
                type:DataTypes.TEXT
            },
            target_period:{
                type:DataTypes.INTEGER
            },
            target_days:{
                type:DataTypes.INTEGER
            },
            participant_count:{
                type:DataTypes.INTEGER
            },
            challenge_img:{
                type:DataTypes.STRING(255)
            },
            start_date:{
                type:DataTypes.DATE, 
                allowNull:false
            },
            end_date:{
                type:DataTypes.DATE,
                allowNull:false
            },
            challenge_status: {
                type: DataTypes.ENUM('대기중', '진행중', '진행완료'),
                defaultValue: '대기중' // 기본값 설정
            }

        },{sequelize, modelName:"Challenge", tableName:"challenge", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    // static associate(db){
        
    // }
}
module.exports = Challenge;