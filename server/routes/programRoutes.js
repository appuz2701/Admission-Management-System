const express = require('express');
const {
  createProgram,
  getPrograms,
  getProgramById,
  createAcademicYear,
  getAcademicYears,
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/academic-year/create', protect, authorize('admin'), createAcademicYear);
router.get('/academic-year/list', protect, getAcademicYears);

router.post('/create', protect, authorize('admin'), createProgram);
router.get('/list', protect, getPrograms);
router.get('/:id', protect, getProgramById);

module.exports = router;