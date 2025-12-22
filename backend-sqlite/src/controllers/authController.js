const { User } = require('../models');
const { sendTokenResponse } = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    garageName,
    garageAddress,
    garageLocation,
    businessLicense,
    serviceRadius
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, password, phone'
    });
  }

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user data object
  const userData = {
    name,
    email,
    password,
    phone,
    role: role || 'customer'
  };

  // Add garage-specific fields if role is admin
  if (role === 'admin') {
    if (!garageName || !garageAddress) {
      return res.status(400).json({
        success: false,
        message: 'Garage name and address are required for garage owners'
      });
    }

    userData.garageName = garageName;
    userData.garageAddress = garageAddress;
    userData.businessLicense = businessLicense;
    userData.serviceRadius = serviceRadius || 10;

    // Add location if provided
    if (garageLocation && garageLocation.coordinates) {
      userData.garageLatitude = garageLocation.coordinates[1];
      userData.garageLongitude = garageLocation.coordinates[0];
    }
  }

  // Create user
  const user = await User.create(userData);

  // Send token response
  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check if user exists (include password for comparison)
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updateprofile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone
  };

  // Add garage-specific fields if user is admin
  if (req.user.role === 'admin') {
    if (req.body.garageName) fieldsToUpdate.garageName = req.body.garageName;
    if (req.body.garageAddress) fieldsToUpdate.garageAddress = req.body.garageAddress;
    if (req.body.serviceRadius) fieldsToUpdate.serviceRadius = req.body.serviceRadius;
    if (req.body.garageLocation && req.body.garageLocation.coordinates) {
      fieldsToUpdate.garageLatitude = req.body.garageLocation.coordinates[1];
      fieldsToUpdate.garageLongitude = req.body.garageLocation.coordinates[0];
    }
  }

  // Remove undefined values
  Object.keys(fieldsToUpdate).forEach(key =>
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  await User.update(fieldsToUpdate, {
    where: { id: req.user.id }
  });

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }

  const user = await User.findByPk(req.user.id);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

/**
 * @desc    Logout user / clear token
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
});
