const express = require('express');
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  createCampus,
  getCampuses,
  createDepartment,
  getDepartments,
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Institution routes
router.post('/create', protect, authorize('admin'), createInstitution);
router.get('/list', protect, getInstitutions);
router.get('/:id', protect, getInstitutionById);

// Campus routes
router.post('/campus/create', protect, authorize('admin'), createCampus);
router.get('/campus/list', protect, getCampuses);

// Department routes
router.post('/department/create', protect, authorize('admin'), createDepartment);
router.get('/department/list', protect, getDepartments);

module.exports = router;