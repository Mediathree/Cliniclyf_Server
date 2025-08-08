const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubSubCategory = sequelize.define('SubSubCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subCategoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'sub_categories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'sub_sub_categories',
    timestamps: true
});

module.exports = SubSubCategory;
