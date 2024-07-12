const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Profile = require('./profile');
const Challenge = require('./challenge');
const ChallengeParticipants = require('./challengeParticipants');
const ChallengeRecord = require('./challengeRecord');
const Post = require("./post");
const Comment = require("./comment");

let sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};
db.sequelize = sequelize;

db.User = User;
db.Profile = Profile;
db.Challenge = Challenge;
db.ChallengeParticipants = ChallengeParticipants;
db.ChallengeRecord = ChallengeRecord;
db.Post = Post;
db.Comment = Comment;

User.initiate(sequelize);
Profile.initiate(sequelize);
Challenge.initiate(sequelize);
ChallengeParticipants.initiate(sequelize);
ChallengeRecord.initiate(sequelize);
Post.initiate(sequelize);
Comment.initiate(sequelize);

User.associate(db);
Profile.associate(db);
Challenge.associate(db);
ChallengeParticipants.associate(db);
ChallengeRecord.associate(db);
Post.associate(db);
Comment.associate(db);

module.exports = db;