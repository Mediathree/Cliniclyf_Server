const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const PermissionCategory = sequelize.define('PermissionCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'permissionCategories',
    timestamps: true,
});

module.exports = PermissionCategory;