const Applicant = require('../models/Applicant');
const Program = require('../models/Program');

exports.allocateSeat = async (req, res) => {
  try {
    const { applicantId, programId } = req.body;
    const io = req.app.get('io');

    if (!applicantId || !programId) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID and Program ID are required',
      });
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    // Find quota
    const quota = program.quotas.find(q => q.name === applicant.quotaType);
    if (!quota) {
      return res.status(400).json({
        success: false,
        message: 'Quota type not found in this program',
      });
    }

    // Check seat availability
    if (quota.filled >= quota.seats) {
      return res.status(400).json({
        success: false,
        message: `No seats available in ${quota.name} quota. Filled: ${quota.filled}/${quota.seats}`,
      });
    }

    // Check if already allotted
    if (applicant.status === 'Allotted' || applicant.status === 'Admitted') {
      return res.status(400).json({
        success: false,
        message: 'Applicant already allotted or admitted',
      });
    }

    // Update quota
    quota.filled += 1;
    program.totalFilled = program.quotas.reduce((sum, q) => sum + q.filled, 0);

    // Update applicant status
    applicant.status = 'Allotted';

    await program.save();
    await applicant.save();

    // Emit socket event for real-time update
    io.emit('seat_allocated', {
      programId,
      quotaType: applicant.quotaType,
      filledSeats: quota.filled,
      totalSeats: quota.seats,
      remainingSeats: quota.seats - quota.filled,
    });

    res.status(200).json({
      success: true,
      message: 'Seat allocated successfully',
      applicant,
      program,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.generateAdmissionNumber = async (req, res) => {
  try {
    const { applicantId } = req.body;

    if (!applicantId) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID is required',
      });
    }

    const applicant = await Applicant.findById(applicantId)
      .populate('program')
      .populate('institution')
      .populate('academicYear');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    if (applicant.admissionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Admission number already generated for this applicant',
      });
    }

    // Check if allotted
    if (applicant.status !== 'Allotted') {
      return res.status(400).json({
        success: false,
        message: 'Applicant must be allotted before generating admission number',
      });
    }

    // Format: INST/YEAR/LEVEL/DEPT/QUOTA/SERIAL
    const inst = applicant.institution.code;
    const year = applicant.academicYear.year;
    const level = applicant.program.courseType; // UG/PG
    const dept = applicant.program.code;
    const quota = applicant.quotaType.substring(0, 3).toUpperCase(); // KCE/COM/MGT

    // Get sequence number
    const count = await Applicant.countDocuments({
      admissionNumber: { $exists: true, $ne: null },
      program: applicant.program,
    });
    const serial = String(count + 1).padStart(4, '0');

    applicant.admissionNumber = `${inst}/${year}/${level}/${dept}/${quota}/${serial}`;

    await applicant.save();

    res.status(200).json({
      success: true,
      message: 'Admission number generated successfully',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.confirmAdmission = async (req, res) => {
  try {
    const { applicantId } = req.body;

    if (!applicantId) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID is required',
      });
    }

    const applicant = await Applicant.findById(applicantId);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    // Check fee status
    if (applicant.feeStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm admission: Fee not paid',
      });
    }

    // Check if admission number is generated
    if (!applicant.admissionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Admission number must be generated before confirmation',
      });
    }

    // Check document verification
    if (applicant.documentStatus !== 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'All documents must be verified before confirmation',
      });
    }

    applicant.status = 'Admitted';
    applicant.admissionConfirmedAt = new Date();

    await applicant.save();

    res.status(200).json({
      success: true,
      message: 'Admission confirmed successfully',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectApplicant = async (req, res) => {
  try {
    const { applicantId } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
      { status: 'Rejected' },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Applicant rejected',
      applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};