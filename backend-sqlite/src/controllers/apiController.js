const { Category, Subcategory, ServiceRequest, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// ==================== CATEGORY CONTROLLERS ====================

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const { count, rows: categories } = await Category.findAndCountAll({
    where,
    include: [{
      model: Subcategory,
      as: 'subcategories',
      attributes: ['id', 'name', 'slug', 'isActive']
    }],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: { categories }
  });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: [{
      model: Subcategory,
      as: 'subcategories',
      where: { isActive: true },
      required: false
    }]
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { category }
  });
});

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, isActive, sortOrder } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a category name'
    });
  }

  const existingCategory = await Category.findOne({ where: { name } });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }

  const category = await Category.create({
    name,
    description,
    icon,
    image,
    isActive,
    sortOrder,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, isActive, sortOrder } = req.body;

  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  await category.update(updateData);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const subcategoryCount = await Subcategory.count({ where: { categoryId: req.params.id } });
  if (subcategoryCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${subcategoryCount} subcategories.`
    });
  }

  await category.destroy();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: {}
  });
});

// ==================== SUBCATEGORY CONTROLLERS ====================

/**
 * @desc    Get all subcategories
 * @route   GET /api/subcategories
 * @access  Public
 */
exports.getSubcategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, isActive } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  if (category) {
    where.categoryId = category;
  }
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const { count, rows: subcategories } = await Subcategory.findAndCountAll({
    where,
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug']
    }],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    success: true,
    count: subcategories.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: { subcategories }
  });
});

/**
 * @desc    Get subcategories by category
 * @route   GET /api/categories/:categoryId/subcategories
 * @access  Public
 */
exports.getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const subcategories = await Subcategory.findAll({
    where: { categoryId, isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: subcategories.length,
    data: {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      subcategories
    }
  });
});

/**
 * @desc    Get single subcategory
 * @route   GET /api/subcategories/:id
 * @access  Public
 */
exports.getSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByPk(req.params.id, {
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug', 'description']
    }]
  });

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { subcategory }
  });
});

/**
 * @desc    Create new subcategory
 * @route   POST /api/subcategories
 * @access  Private/Admin
 */
exports.createSubcategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    categoryId,
    icon,
    image,
    estimatedDuration,
    priceMin,
    priceMax,
    isActive,
    sortOrder
  } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide subcategory name and category'
    });
  }

  const categoryExists = await Category.findByPk(categoryId);
  if (!categoryExists) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const existingSubcategory = await Subcategory.findOne({
    where: { name, categoryId }
  });
  if (existingSubcategory) {
    return res.status(400).json({
      success: false,
      message: 'Subcategory with this name already exists in this category'
    });
  }

  const subcategory = await Subcategory.create({
    name,
    description,
    categoryId,
    icon,
    image,
    estimatedDuration,
    priceMin,
    priceMax,
    isActive,
    sortOrder,
    createdBy: req.user.id
  });

  await subcategory.reload({
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug']
    }]
  });

  res.status(201).json({
    success: true,
    message: 'Subcategory created successfully',
    data: { subcategory }
  });
});

/**
 * @desc    Update subcategory
 * @route   PUT /api/subcategories/:id
 * @access  Private/Admin
 */
exports.updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByPk(req.params.id);

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  const {
    name,
    description,
    categoryId,
    icon,
    image,
    estimatedDuration,
    priceMin,
    priceMax,
    isActive,
    sortOrder
  } = req.body;

  if (categoryId && categoryId !== subcategory.categoryId) {
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  }

  if (name && name !== subcategory.name) {
    const existingSubcategory = await Subcategory.findOne({
      where: {
        name,
        categoryId: categoryId || subcategory.categoryId,
        id: { [Op.ne]: req.params.id }
      }
    });
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (icon !== undefined) updateData.icon = icon;
  if (image !== undefined) updateData.image = image;
  if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
  if (priceMin !== undefined) updateData.priceMin = priceMin;
  if (priceMax !== undefined) updateData.priceMax = priceMax;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  await subcategory.update(updateData);

  await subcategory.reload({
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug']
    }]
  });

  res.status(200).json({
    success: true,
    message: 'Subcategory updated successfully',
    data: { subcategory }
  });
});

/**
 * @desc    Delete subcategory
 * @route   DELETE /api/subcategories/:id
 * @access  Private/Admin
 */
exports.deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByPk(req.params.id);

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  await subcategory.destroy();

  res.status(200).json({
    success: true,
    message: 'Subcategory deleted successfully',
    data: {}
  });
});

// ==================== SERVICE REQUEST CONTROLLERS ====================

/**
 * @desc    Get all service requests
 * @route   GET /api/service-requests
 * @access  Private
 */
exports.getServiceRequests = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    subcategory,
    priority,
    startDate,
    endDate,
    search
  } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // Filter by user role
  if (req.user.role === 'customer') {
    where.customerId = req.user.id;
  } else if (req.user.role === 'admin') {
    where.assignedToId = req.user.id;
  }

  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (subcategory) where.subcategoryId = subcategory;
  if (priority) where.priority = priority;

  if (startDate || endDate) {
    where.preferredDate = {};
    if (startDate) where.preferredDate[Op.gte] = startDate;
    if (endDate) where.preferredDate[Op.lte] = endDate;
  }

  if (search) {
    where[Op.or] = [
      { requestNumber: { [Op.like]: `%${search}%` } },
      { customerName: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: serviceRequests } = await ServiceRequest.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Subcategory,
        as: 'subcategory',
        attributes: ['id', 'name', 'slug', 'estimatedDuration']
      },
      {
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'garageName', 'phone']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    success: true,
    count: serviceRequests.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: { serviceRequests }
  });
});

/**
 * @desc    Get single service request
 * @route   GET /api/service-requests/:id
 * @access  Private
 */
exports.getServiceRequest = asyncHandler(async (req, res) => {
  const serviceRequest = await ServiceRequest.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'description']
      },
      {
        model: Subcategory,
        as: 'subcategory',
        attributes: ['id', 'name', 'slug', 'description', 'estimatedDuration', 'priceMin', 'priceMax']
      },
      {
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'garageName', 'garageAddress', 'phone', 'email']
      }
    ]
  });

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  // Check authorization
  if (
    req.user.role === 'customer' &&
    serviceRequest.customerId !== req.user.id
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this service request'
    });
  }

  if (
    req.user.role === 'admin' &&
    serviceRequest.assignedToId &&
    serviceRequest.assignedToId !== req.user.id
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this service request'
    });
  }

  res.status(200).json({
    success: true,
    data: { serviceRequest }
  });
});

/**
 * @desc    Create new service request
 * @route   POST /api/service-requests
 * @access  Private/Customer
 */
exports.createServiceRequest = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    categoryId,
    subcategoryId,
    address,
    location,
    addressPin,
    preferredDate,
    preferredTime,
    description,
    images,
    priority
  } = req.body;

  // Validate required fields
  if (!customerName || !customerPhone || !categoryId || !subcategoryId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  if (!address || !address.fullAddress) {
    return res.status(400).json({
      success: false,
      message: 'Please provide full address'
    });
  }

  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid location coordinates [longitude, latitude]'
    });
  }

  if (!preferredDate || !preferredTime || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide preferred date, time and description'
    });
  }

  // Verify category and subcategory exist
  const category = await Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const subcategory = await Subcategory.findOne({
    where: { id: subcategoryId, categoryId }
  });
  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found or does not belong to the selected category'
    });
  }

  const serviceRequest = await ServiceRequest.create({
    customerId: req.user.id,
    customerName,
    customerPhone,
    customerEmail: customerEmail || req.user.email,
    categoryId,
    subcategoryId,
    addressStreet: address.street || '',
    addressCity: address.city || '',
    addressState: address.state || '',
    addressZipCode: address.zipCode || '',
    addressFull: address.fullAddress,
    locationLatitude: location.coordinates[1],
    locationLongitude: location.coordinates[0],
    addressPin,
    preferredDate,
    preferredTime,
    description,
    images: images ? JSON.stringify(images) : '[]',
    priority: priority || 'medium',
    status: 'pending'
  });

  await serviceRequest.reload({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug', 'estimatedDuration'] },
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Service request created successfully',
    data: { serviceRequest }
  });
});

/**
 * @desc    Update service request status
 * @route   PUT /api/service-requests/:id/status
 * @access  Private
 */
exports.updateServiceRequestStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a status'
    });
  }

  const serviceRequest = await ServiceRequest.findByPk(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  // Check authorization
  if (req.user.role === 'customer') {
    if (serviceRequest.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request'
      });
    }
    if (status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Customers can only cancel service requests'
      });
    }
  }

  if (req.user.role === 'admin') {
    if (serviceRequest.assignedToId && serviceRequest.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service request'
      });
    }
  }

  await serviceRequest.updateStatusWithHistory(status, req.user.id, comment);

  await serviceRequest.reload({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
      { model: User, as: 'assignedTo', attributes: ['id', 'name', 'garageName', 'phone'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Service request status updated successfully',
    data: { serviceRequest }
  });
});

/**
 * @desc    Assign service request to garage
 * @route   PUT /api/service-requests/:id/assign
 * @access  Private/Admin
 */
exports.assignServiceRequest = asyncHandler(async (req, res) => {
  const { garageId } = req.body;

  if (!garageId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a garage ID'
    });
  }

  const serviceRequest = await ServiceRequest.findByPk(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  const garage = await User.findOne({ where: { id: garageId, role: 'admin' } });
  if (!garage) {
    return res.status(404).json({
      success: false,
      message: 'Garage not found'
    });
  }

  await serviceRequest.update({
    assignedToId: garageId,
    status: 'assigned'
  });

  await serviceRequest.updateStatusWithHistory(
    'assigned',
    req.user.id,
    `Assigned to ${garage.garageName || garage.name}`
  );

  await serviceRequest.reload({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
      { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
      { model: User, as: 'assignedTo', attributes: ['id', 'name', 'garageName', 'phone', 'email'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Service request assigned successfully',
    data: { serviceRequest }
  });
});

/**
 * @desc    Find nearby garages
 * @route   GET /api/service-requests/:id/nearby-garages
 * @access  Private
 */
exports.findNearbyGarages = asyncHandler(async (req, res) => {
  const { maxDistance = 10 } = req.query;

  const serviceRequest = await ServiceRequest.findByPk(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  // Simple distance calculation (for more accuracy, use Haversine formula)
  const nearbyGarages = await User.findAll({
    where: {
      role: 'admin',
      isActive: true,
      garageLatitude: { [Op.ne]: null },
      garageLongitude: { [Op.ne]: null }
    },
    attributes: ['id', 'name', 'garageName', 'garageAddress', 'phone', 'email', 'serviceRadius', 'garageLatitude', 'garageLongitude'],
    limit: 10
  });

  res.status(200).json({
    success: true,
    count: nearbyGarages.length,
    data: {
      serviceRequest: {
        id: serviceRequest.id,
        locationLatitude: serviceRequest.locationLatitude,
        locationLongitude: serviceRequest.locationLongitude,
        addressFull: serviceRequest.addressFull
      },
      garages: nearbyGarages
    }
  });
});

/**
 * @desc    Add review
 * @route   POST /api/service-requests/:id/review
 * @access  Private/Customer
 */
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a rating between 1 and 5'
    });
  }

  const serviceRequest = await ServiceRequest.findByPk(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  if (serviceRequest.customerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review this service request'
    });
  }

  if (serviceRequest.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Can only review completed service requests'
    });
  }

  if (serviceRequest.rating) {
    return res.status(400).json({
      success: false,
      message: 'Service request has already been reviewed'
    });
  }

  await serviceRequest.update({
    rating,
    review: review || '',
    reviewedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Review added successfully',
    data: { serviceRequest }
  });
});

/**
 * @desc    Cancel service request
 * @route   DELETE /api/service-requests/:id
 * @access  Private/Customer
 */
exports.cancelServiceRequest = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;

  const serviceRequest = await ServiceRequest.findByPk(req.params.id);

  if (!serviceRequest) {
    return res.status(404).json({
      success: false,
      message: 'Service request not found'
    });
  }

  if (serviceRequest.customerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this service request'
    });
  }

  if (serviceRequest.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel completed service requests'
    });
  }

  await serviceRequest.update({
    status: 'cancelled',
    cancelledAt: new Date(),
    cancellationReason: cancellationReason || 'Cancelled by customer'
  });

  await serviceRequest.updateStatusWithHistory(
    'cancelled',
    req.user.id,
    cancellationReason || 'Cancelled by customer'
  );

  res.status(200).json({
    success: true,
    message: 'Service request cancelled successfully',
    data: { serviceRequest }
  });
});
