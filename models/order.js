const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    razorpay_order_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    orderableType: {
        type: DataTypes.ENUM('PRODUCT', 'DOCTOR', 'CLINIC'),
        allowNull: false,
    },
    orderableId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED'),
        defaultValue: 'PENDING',
    }
}, {
    tableName: 'orders',
    timestamps: true,
});

module.exports = Order;