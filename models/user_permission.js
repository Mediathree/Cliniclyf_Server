const { DataTypes, NOW } = require("sequelize");
const sequelize = require("../config/db");

const User_Permission = sequelize.define(
    "User_Permission",
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
        permission_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "permissions",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        allowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        tableName: "user_permissions",
        timestamps: true,

        indexes: [
            {
                unique: true,
                fields: ['user_id', 'permission_id']
            }
        ]
    }
);

module.exports = User_Permission;
