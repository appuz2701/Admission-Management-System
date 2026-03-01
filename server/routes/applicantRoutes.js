const express = require('express');
const {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateDocumentStatus,
  updateFeeStatus,
} = require('../controllers/applicantController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, authorize('admin', 'admission_officer'), createApplicant);
router.get('/list', protect, getApplicants);
router.get('/:id', protect, getApplicantById);
router.patch('/:id/document-status', protect, authorize('admin', 'admission_officer'), updateDocumentStatus);
router.patch('/:id/fee-status', protect, authorize('admin', 'admission_officer'), updateFeeStatus);

module.exports = router;