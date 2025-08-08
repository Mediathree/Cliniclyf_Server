const { DataTypes, NOW } = require("sequelize");
const sequelize = require("../config/db");

const User_Group = sequelize.define(
    "User_Group",
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
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        group_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "groups",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        joined_at: {
            type: DataTypes.DATE,
            defaultValue: NOW,
            allowNull: false,
        },
    },
    {
        tableName: "user_groups",
        timestamps: true,
    }
);

module.exports = User_Group;
