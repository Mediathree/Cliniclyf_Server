const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Clinic = sequelize.define(
    "Clinic",
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
        overview: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "inactive",
        }
    },
    {
        tableName: "clinics",
        timestamps: true,
    }
);

module.exports = Clinic;
