const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define(
    "Payment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payableId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: 'RAZORPAY',
        },
        payableType: {
            type: DataTypes.ENUM('PLAN', 'PRODUCT', 'APPOINTMENT'),
            allowNull: false,
        },
        razorpayOrderId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        razorpayPaymentId: {
            type: DataTypes.STRING,
            allowNull: true, // only after success
        },
        razorpaySignature: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'INR',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
            defaultValue: 'PENDING',
        }
    },
    {
        tableName: "payments",
        timestamps: true
    }
);


module.exports = Payment;