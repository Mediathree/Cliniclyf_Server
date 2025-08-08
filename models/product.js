const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
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
    subCategoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'sub_categories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    subSubCategoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'sub_sub_categories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    discountType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    freeDelivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }
}, {
    tableName: 'products',
    timestamps: true
});

module.exports = Product;
