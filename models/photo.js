const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Photo = sequelize.define('Photo', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    photoable_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'photos',
    timestamps: true,
});

module.exports = Photo;