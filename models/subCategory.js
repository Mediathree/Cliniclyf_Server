const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubCategory = sequelize.define('SubCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'sub_categories',
    timestamps: true
});

module.exports = SubCategory;
