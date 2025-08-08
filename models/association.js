
// Import all models
const User = require('./user');
const Role = require('./role');
const Appointment = require('./appointment');
const { Doctor, Timing, WorkingDay } = require('./doctor');
const Clinic = require('./clinic');
const Payment = require('./payment');
const Address = require('./address');
const Rating = require('./rating');
const Plan = require('./plan');
const Order = require('./order');
const Photo = require('./photo');
const Service = require('./service');
const Subscription = require('./subscription');
const Product = require('./product');
const UserAddress = require('./address');
const Category = require('./Category');
const SubCategory = require('./SubCategory');
const SubSubCategory = require('./SubSubCategory');
const ShippingAddress = require('./shippingAddress');

/**
 * Setup all model associations
 */
const setupAssociations = () => {
  User.hasOne(Doctor, { foreignKey: "user_id" });
  Doctor.belongsTo(User, { foreignKey: "user_id" });

  User.hasOne(UserAddress, { foreignKey: "user_id" });
  UserAddress.belongsTo(User, { foreignKey: "user_id" });

  User.hasOne(Doctor, { foreignKey: "clinic_id", as: "clinic" });
  Doctor.belongsTo(User, { foreignKey: "clinic_id", as: "clinic" });

  User.hasOne(Clinic, { foreignKey: "user_id" });
  Clinic.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Address, { foreignKey: "user_id" });
  Address.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Photo, { foreignKey: "photoable_id" });
  Photo.belongsTo(User, { foreignKey: "photoable_id" });

  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Subscription, { foreignKey: "subscriber_id", as: "subscribedFor" });
  Subscription.belongsTo(User, { foreignKey: "subscriber_id", as: "subscribedFor" });

  User.hasMany(Subscription, { foreignKey: "user_id", as: "subscribedBy" });
  Subscription.belongsTo(User, { foreignKey: "user_id", as: "subscribedBy" });

  User.hasMany(Rating, { foreignKey: "reviewable_id", as: "receivedBy" });
  Rating.belongsTo(User, { foreignKey: "reviewable_id", as: "receivedBy" });

  User.hasMany(Rating, { foreignKey: "user_id", as: "givenBy" });
  Rating.belongsTo(User, { foreignKey: "user_id", as: "givenBy" });

  User.hasMany(Service, { foreignKey: "user_id" });
  Service.belongsTo(User, { foreignKey: "user_id" });

  Plan.hasMany(Subscription, { foreignKey: "plan_id" });
  Subscription.belongsTo(Plan, { foreignKey: "plan_id" });

  Product.hasOne(Photo, { foreignKey: "photoable_id" });
  Photo.belongsTo(Product, { foreignKey: "photoable_id" });

  Product.hasMany(Rating, { foreignKey: "reviewable_id" });
  Rating.belongsTo(Product, { foreignKey: "reviewable_id" });

  User.hasMany(Timing, { foreignKey: 'user_id' });
  Timing.belongsTo(User, { foreignKey: 'user_id' });

  User.hasMany(WorkingDay, { foreignKey: 'user_id' });
  WorkingDay.belongsTo(User, { foreignKey: 'user_id' });

  Product.belongsTo(Category, { foreignKey: 'categoryId' });
  Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });
  Product.belongsTo(SubSubCategory, { foreignKey: 'subSubCategoryId' });

  Category.hasMany(Product, { foreignKey: 'categoryId' });
  SubCategory.hasMany(Product, { foreignKey: 'subCategoryId' });
  SubSubCategory.hasMany(Product, { foreignKey: 'subSubCategoryId' });

  SubCategory.belongsTo(Category, { foreignKey: 'categoryId' });
  Category.hasMany(SubCategory, { foreignKey: 'categoryId' });

  SubSubCategory.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });
  SubCategory.hasMany(SubSubCategory, { foreignKey: 'subCategoryId' });

  ShippingAddress.belongsTo(User, { foreignKey: 'userId' });
  User.hasMany(ShippingAddress, { foreignKey: 'userId' });

  ShippingAddress.belongsTo(Order, { foreignKey: 'orderId' });
  Order.hasOne(ShippingAddress, { foreignKey: 'orderId' });

  // 1. Payment belongs to Appointment (for payableType = 'APPOINTMENT')
  Payment.belongsTo(Appointment, {
    foreignKey: "payableId",
    constraints: false,
    as: "appointment",
  });

  // 2. Appointment belongs to User (patient info)
  Appointment.belongsTo(User, {
    foreignKey: "patient_id",
    as: "patient",
  });
};


module.exports = setupAssociations;
