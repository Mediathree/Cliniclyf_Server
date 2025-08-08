const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permission = sequelize.define(
    "Permission",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "permissionCategories",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "permissions",
        timestamps: true,
    }
);

module.exports = Permission;
