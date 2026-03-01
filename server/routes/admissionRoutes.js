const express = require('express');
const {
  allocateSeat,
  generateAdmissionNumber,
  confirmAdmission,
} = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/allocate-seat', protect, authorize('admin', 'admission_officer'), allocateSeat);
router.post('/generate-number', protect, authorize('admin', 'admission_officer'), generateAdmissionNumber);
router.post('/confirm', protect, authorize('admin', 'admission_officer'), confirmAdmission);

module.exports = router;