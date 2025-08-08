const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Group = sequelize.define(
    "Group",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        tableName: "groups",
        timestamps: true,
    }
);

module.exports = Group;
