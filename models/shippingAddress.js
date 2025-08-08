const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ShippingAddress = sequelize.define('ShippingAddress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    orderId: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    addressLine1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    addressLine2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    country: DataTypes.STRING,
    phoneNumber: DataTypes.STRING
}, {
    tableName: 'shipping_addresses',
    timestamps: true
});

module.exports = ShippingAddress;
