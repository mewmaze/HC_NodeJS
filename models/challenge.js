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
            description:{
                type:DataTypes.TEXT},
            target_days:{
                type:DataTypes.INTEGER},
            participant_count:{
                type:DataTypes.INTEGER},
            challenge_img:{
                type:DataTypes.STRING(255)},
            start_date:{type:DataTypes.DATE},
            end_date:{type:DataTypes.DATE}
        },{sequelize, modelName:"Challenge", tableName:"challenge", paranoid:false, timestamps:false})
    }
    static associate(db){
        
    }
}
module.exports = Challenge;