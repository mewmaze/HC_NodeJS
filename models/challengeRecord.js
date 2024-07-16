const {Model, DataTypes} = require("sequelize");

class ChallengeRecord extends Model {
    static initiate(sequelize) {
        return ChallengeRecord.init({
            compelete_id:{
                type:DataTypes.INTEGER, 
                primaryKey:true, 
                autoIncrement:true},
            participant_id:{
                type:DataTypes.INTEGER, 
                allowNull:false},
            user_id:{
                type:DataTypes.INTEGER,
                allowNull:false},
            exercise_date:{
                type:DataTypes.DATE, 
                allowNull:true},
        },{sequelize, modelName:"ChallengeRecord", tableName:"challengeRecord", paranoid:false, timestamps:false})
    }
    static associate(models){
        this.belongsTo(models.ChallengeParticipants, {foreignKey:"participant_id"});
        this.belongsTo(models.User, {foreignKey:"user_id"});
    }
}
module.exports = ChallengeRecord;