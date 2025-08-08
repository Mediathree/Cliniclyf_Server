const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Setting = sequelize.define(
    "Setting",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        credit_alert_threshold: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gst: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        enable_razorpay: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        enable_card: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        enable_upi: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        grace_period: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cancellation_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        allow_reschedule: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        late_cancellation_panelty: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        appointment_booked_email_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        payment_success_email_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        low_credit_email_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        appointment_booked_whatsapp_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        payment_success_whatsapp_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        low_credit_whatsapp_alert: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        custom_notification: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        appointment_reminder_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        enable_2factor_authentication: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        enable_backup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        session_timeout: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            allowNull: true,
        }
    },
    {
        tableName: 'settings',
        timestamps: true
    }
);


module.exports = Setting;
