const User = require('./User');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const ServiceRequest = require('./ServiceRequest');

// Define associations

// User associations
User.hasMany(Category, {
  foreignKey: 'createdBy',
  as: 'categories'
});

User.hasMany(Subcategory, {
  foreignKey: 'createdBy',
  as: 'subcategories'
});

User.hasMany(ServiceRequest, {
  foreignKey: 'customerId',
  as: 'serviceRequests'
});

User.hasMany(ServiceRequest, {
  foreignKey: 'assignedToId',
  as: 'assignedRequests'
});

// Category associations
Category.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

Category.hasMany(Subcategory, {
  foreignKey: 'categoryId',
  as: 'subcategories',
  onDelete: 'CASCADE'
});

Category.hasMany(ServiceRequest, {
  foreignKey: 'categoryId',
  as: 'serviceRequests'
});

// Subcategory associations
Subcategory.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Subcategory.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

Subcategory.hasMany(ServiceRequest, {
  foreignKey: 'subcategoryId',
  as: 'serviceRequests'
});

// ServiceRequest associations
ServiceRequest.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});

ServiceRequest.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo'
});

ServiceRequest.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

ServiceRequest.belongsTo(Subcategory, {
  foreignKey: 'subcategoryId',
  as: 'subcategory'
});

module.exports = {
  User,
  Category,
  Subcategory,
  ServiceRequest
};
