const {Model, DataTypes} = require("sequelize");

class Profile extends Model {
    static initiate(sequelize) {
        return Profile.init({
            profile_id:{
                type:DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true},
            nickname:{
                type:DataTypes.STRING(50), 
                allowNull:false},
            intro:{
                type:DataTypes.TEXT, 
                allowNull:true},
            achievement_count:{
                type:DataTypes.INTEGER, 
                allowNull:true, 
                defaultValue: 0},
            profile_picture: {
                type: DataTypes.STRING(255), // 수정: 문자열 타입으로 변경
                allowNull: true, // 필요에 따라 allowNull 설정 변경
                defaultValue: ''},
        },{sequelize, modelName:"Profile", tableName:"profile", paranoid:false, timestamps:false})
    }
    static associate(models){
        this.belongsTo(models.User, {foreignKey:"user_id"});
    }
}
module.exports = Profile;