const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Rating = sequelize.define(
    "Rating",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        reviewable_id: {
            type: DataTypes.UUID,
            allowNull: false,
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
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true, // review is optional if you just want to rate
        }
    },
    {
        tableName: "ratings",
        timestamps: true,
    }
);

module.exports = Rating;