const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Doctor = sequelize.define('Doctor', {
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
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    about: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    appointmentFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    clinic_id: {
        type: DataTypes.UUID,
        references: {
            model: 'users', // Refers to `users` table
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'doctors',
    timestamps: true
});

// Timing model with foreign key
const Timing = sequelize.define('Timing', {
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
    slot: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'timings',
    timestamps: true
});

// WorkingDay model with foreign key
const WorkingDay = sequelize.define('WorkingDay', {
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
    day: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slot: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'workingDays',
    timestamps: true
});

module.exports = { Doctor, Timing, WorkingDay };