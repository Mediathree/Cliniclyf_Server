const { DataTypes, NOW } = require("sequelize");
const sequelize = require("../config/db");

const Group_Permission = sequelize.define(
    "Group_Permission",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        tableName: "group_permissions",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['group_id', 'permission_id']
            }
        ]
    }
);

module.exports = Group_Permission;