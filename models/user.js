const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    mobile_no: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles', // Refers to `roles` table
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    site_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    support_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    support_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enable_maintainance: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    maintainance_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
);

// Hash password before saving user
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});


module.exports = User;
