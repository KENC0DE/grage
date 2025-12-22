const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const authController = require('../controllers/authController');
const apiController = require('../controllers/apiController');

// ==================== AUTH ROUTES ====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.put('/auth/updateprofile', protect, authController.updateProfile);
router.put('/auth/updatepassword', protect, authController.updatePassword);
router.post('/auth/logout', protect, authController.logout);

// ==================== CATEGORY ROUTES ====================
router.get('/categories', apiController.getCategories);
router.get('/categories/:id', apiController.getCategory);
router.post('/categories', protect, authorize('admin', 'super_admin'), apiController.createCategory);
router.put('/categories/:id', protect, authorize('admin', 'super_admin'), apiController.updateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'super_admin'), apiController.deleteCategory);

// ==================== SUBCATEGORY ROUTES ====================
router.get('/subcategories', apiController.getSubcategories);
router.get('/categories/:categoryId/subcategories', apiController.getSubcategoriesByCategory);
router.get('/subcategories/:id', apiController.getSubcategory);
router.post('/subcategories', protect, authorize('admin', 'super_admin'), apiController.createSubcategory);
router.put('/subcategories/:id', protect, authorize('admin', 'super_admin'), apiController.updateSubcategory);
router.delete('/subcategories/:id', protect, authorize('admin', 'super_admin'), apiController.deleteSubcategory);

// ==================== SERVICE REQUEST ROUTES ====================
router.get('/service-requests', protect, apiController.getServiceRequests);
router.get('/service-requests/:id', protect, apiController.getServiceRequest);
router.post('/service-requests', protect, authorize('customer'), apiController.createServiceRequest);
router.put('/service-requests/:id/status', protect, apiController.updateServiceRequestStatus);
router.put('/service-requests/:id/assign', protect, authorize('admin', 'super_admin'), apiController.assignServiceRequest);
router.get('/service-requests/:id/nearby-garages', protect, apiController.findNearbyGarages);
router.post('/service-requests/:id/review', protect, authorize('customer'), apiController.addReview);
router.delete('/service-requests/:id', protect, authorize('customer'), apiController.cancelServiceRequest);

module.exports = router;
