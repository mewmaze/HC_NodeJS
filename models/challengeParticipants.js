const {Model, DataTypes} = require("sequelize");

class ChallengeParticipants extends Model {
    static initiate(sequelize) {
        return ChallengeParticipants.init({
            id:{
                type:DataTypes.INTEGER, 
                primaryKey:true, 
                autoIncrement:true},
            challenge_id:{
                type:DataTypes.INTEGER, 
                allowNull:false},
            user_id:{
                type:DataTypes.INTEGER, 
                allowNull:false},
            progress:{
                type:DataTypes.STRING(255),
                allowNull:true},
            completion_date:{
                type:DataTypes.DATE,
                allowNull:true},
        },{sequelize, modelName:"ChallengeParticipants", tableName:"challengeParticipants", paranoid:false, timestamps:false})
    }
    static associate(models){
        this.belongsTo(models.Challenge, {foreignKey:"challenge_id"});
        this.belongsTo(models.User, {foreignKey:"user_id"});
    }
}
module.exports = ChallengeParticipants;