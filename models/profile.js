const {Model, DataTypes} = require("sequelize");

class Profile extends Model {
    static initiate(sequelize) {
        return Profile.init({
            profile_id:{
                type:DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            user_id:{
                type:DataTypes.INTEGER,
                allowNull:false},
            nickname:{
                type:DataTypes.STRING(50), 
                allowNull:false},
            intro:{
                type:DataTypes.TEXT, 
                allowNull:true},
            achievement_count:{
                type:DataTypes.INTEGER, 
                allowNull:false, 
                default:0},
        },{sequelize, modelName:"Profile", tableName:"profile", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(models){
        this.belongsTo(models.User, {foreignKey:"user_id"});
        this.belongsTo(models.User, {foreignKey:"profile_picture"});
    }
}
module.exports = Profile;