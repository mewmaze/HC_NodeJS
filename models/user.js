// bookid(pri, int), bookname(varchar(40)).
// publisher(varchar(40)). price(int) 

const {Model, DataTypes, Sequelize} = require("sequelize");

class User extends Model {
    static initiate(sequelize) {
        return User.init({
            // 식별키
            user_id:{
                type:DataTypes.INTEGER, 
                autoIncrement:true, 
                primaryKey:true, 
                allowNull:false},
            username:{
                type:DataTypes.STRING(50), 
                unique: true, 
                allowNull:false},
            email:{
                type:DataTypes.STRING(100), 
                unique: true, 
                allowNull:false},
            password_hash:{
                type:DataTypes.STRING(255), 
                allowNull:false},
            gender:{
                type:DataTypes.ENUM('남성', '여성'),
                allowNull: true,
                defaultValue: '남성'},
            height:{
                type:DataTypes.TEXT, 
                allowNull:false},
            weight:{
                type:DataTypes.TEXT, 
                allowNull:false},
            age:{
                type:DataTypes.TEXT, 
                allowNull:true},
            profile_picture:{
                type:DataTypes.STRING(255), 
                allowNull:true},
            goals:{
                type:DataTypes.TEXT, 
                allowNull:true},
            interests:{
                type:DataTypes.ENUM('런닝', '헬스', '자전거', '다이어트'),
                allowNull: false,
                defaultValue: '런닝'},
            current_challenge_id:{
                type:DataTypes.INTEGER, 
                allowNull:true},
            created_at:{
                type:DataTypes.DATE,
                defaultValue:Sequelize.fn('now'),
                allowNull:false,
            },
        },{sequelize, modelName:"User", tableName:"user", paranoid:false, timestamps:false, charset:"utf8mb4", collate:"utf8mb4_general_ci",})
    }
    static associate(db){
        // User.hasMany(db.Order, {foreignKey:"bookid"}) // 설정 필요
    }
}
module.exports = User;