const {Model, DataTypes} = require("sequelize");

class Challenge extends Model {
    static initiate(sequelize) {
        return Challenge.init({
            challenge_id:{
                type:DataTypes.INTEGER, 
                primaryKey:true, 
                autoIncrement:true},
            challenge_name:{
                type:DataTypes.STRING(255), 
                allowNull:false},
            challenge_description:{
                type:DataTypes.TEXT, 
                allowNull:false},
            target_days:{
                type:DataTypes.INTEGER, 
                allowNull:true},
            participant_count:{
                type:DataTypes.INTEGER, 
                allowNull:true},
            start_date:{
                type:DataTypes.DATE,
                allowNull:true
            },
            end_date:{
                type:DataTypes.DATE,
                allowNull:true,
            },
            reward:{
                type:DataTypes.STRING(255),
                allowNull:true,
            },
        },{sequelize, modelName:"Challenge", tableName:"challenge", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(db){
        
    }
}
module.exports = Challenge;