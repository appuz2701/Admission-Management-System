const Applicant = require('../models/Applicant');
const Program = require('../models/Program');

exports.createApplicant = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      category,
      address,
      program,
      institution,
      academicYear,
      entryType,
      quotaType,
      marks,
      rank,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender || !category || !address) {
      return res.status(400).json({
        success: false,
        message: 'All applicant details are required',
      });
    }

    // Check if applicant already exists
    let applicant = await Applicant.findOne({ email, program });
    if (applicant) {
      return res.status(400).json({
        success: false,
        message: 'Applicant already exists for this program',
      });
    }

    applicant = new Applicant({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      category,
      address,
      program,
      institution,
      academicYear,
      entryType,
      quotaType,
      marks,
      rank,
    });

    await applicant.save();
    await applicant.populate(['program', 'institution', 'academicYear']);

    res.status(201).json({
      success: true,
      message: 'Applicant created successfully',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const { program, institution, status, quotaType, documentStatus, feeStatus } = req.query;
    const filter = {};

    if (program) filter.program = program;
    if (institution) filter.institution = institution;
    if (status) filter.status = status;
    if (quotaType) filter.quotaType = quotaType;
    if (documentStatus) filter.documentStatus = documentStatus;
    if (feeStatus) filter.feeStatus = feeStatus;

    const applicants = await Applicant.find(filter)
      .populate('program')
      .populate('institution')
      .populate('academicYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate('program')
      .populate('institution')
      .populate('academicYear');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['program', 'institution', 'academicYear']);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Applicant updated successfully',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { documentStatus } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { documentStatus },
      { new: true }
    ).populate(['program', 'institution', 'academicYear']);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document status updated',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateFeeStatus = async (req, res) => {
  try {
    const { feeStatus, feeAmount } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      {
        feeStatus,
        feeAmount,
        feePaidDate: feeStatus === 'Paid' ? new Date() : null,
      },
      { new: true }
    ).populate(['program', 'institution', 'academicYear']);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee status updated',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { name, type, url, status } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
      {
        $push: {
          documents: {
            name,
            type,
            url,
            uploadedAt: new Date(),
            status: status || 'Submitted',
          },
        },
      },
      { new: true }
    ).populate(['program', 'institution', 'academicYear']);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};