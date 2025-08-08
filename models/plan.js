const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Plan = sequelize.define(
    "Plan",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userType: {
            type: DataTypes.ENUM('CLINIC', 'DOCTOR'),
            allowNull: false,
        },
        // planType: {
        //     type: DataTypes.ENUM('BASE', 'PRO'),
        //     allowNull: false,
        // },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        features: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: "INR",
            allowNull: false,
        },
        durationInMonths: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    },
    {
        tableName: "plans",
        timestamps: true,
    }
);

module.exports = Plan;