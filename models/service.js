const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define(
    "Service",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // Refers to `users` table
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        tableName: "services",
        timestamps: true,
    }
);

module.exports = Service;