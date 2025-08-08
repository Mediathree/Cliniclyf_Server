const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Location = sequelize.define(
    "Location",
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true,
        },
    },
    { tableName: "locations" }
);

module.exports = Location;
