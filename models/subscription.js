const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Subscription = sequelize.define('Subscription', {
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
    subscriber_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', // Refers to `users` table
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'plans',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED'),
        defaultValue: 'ACTIVE',
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
});

module.exports = Subscription;  