// Imports of packages
const { Sequelize, DataTypes, Model, QueryTypes } = require('sequelize');

// Creation of link with db
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: "db.sqlite"
});

// Creation of tables
class User extends Model { }
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    pseudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'users' });

class Email extends Model { }
Email.init({
    email: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    },
}, { sequelize, modelName: 'emails' });

class Article extends Model { } //check https://www.bezkoder.com/node-js-upload-image-mysql/
Article.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB("long"),
        allowNull: false
    },
    date: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'articles' });

const DBOperations = {
    //func
}

module.exports = DBOperations;

sequelize.sync();