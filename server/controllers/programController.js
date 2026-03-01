const Program = require('../models/Program');
const AcademicYear = require('../models/AcademicYear');

// Academic Year Controllers
exports.createAcademicYear = async (req, res) => {
  try {
    const { year, startDate, endDate, admissionStartDate, admissionEndDate, institution } = req.body;

    if (!year || !startDate || !endDate || !institution) {
      return res.status(400).json({
        success: false,
        message: 'Year, start date, end date, and institution are required',
      });
    }

   let academicYear = await AcademicYear.findOne({ year, institution });  
   if (academicYear) {
  return res.status(400).json({
    success: false,
    message: 'Academic year already exists for this institution',
  });
}

    academicYear = new AcademicYear({
      year,
      startDate,
      endDate,
      admissionStartDate,
      admissionEndDate,
      institution,
    });

    await academicYear.save();
    await academicYear.populate('institution');

    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      academicYear,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAcademicYears = async (req, res) => {
  try {
    const { institution } = req.query;
    const filter = institution ? { institution } : {};
    const academicYears = await AcademicYear.find(filter)
      .populate('institution')
      .sort({ year: -1 });

    res.status(200).json({
      success: true,
      count: academicYears.length,
      academicYears,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Program Controllers
exports.createProgram = async (req, res) => {
  try {
    const {
      name,
      code,
      department,
      institution,
      academicYear,
      courseType,
      entryType,
      admissionMode,
      totalIntake,
      quotas,
      supernumerarySeats,
    } = req.body;

    if (!name || !code || !department || !institution || !academicYear || !totalIntake || !quotas) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Validate quotas sum
    const totalQuotaSeats = quotas.reduce((sum, q) => sum + q.seats, 0);
    if (totalQuotaSeats !== totalIntake) {
      return res.status(400).json({
        success: false,
        message: `Total quota seats (${totalQuotaSeats}) must equal total intake (${totalIntake})`,
      });
    }

    const program = new Program({
      name,
      code: code.toUpperCase(),
      department,
      institution,
      academicYear,
      courseType,
      entryType,
      admissionMode,
      totalIntake,
      quotas,
      supernumerarySeats: supernumerarySeats || { total: 0, filled: 0 },
    });

    await program.save();
    await program.populate(['department', 'institution', 'academicYear']);

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      program,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const { institution, academicYear, department } = req.query;
    const filter = {};

    if (institution) filter.institution = institution;
    if (academicYear) filter.academicYear = academicYear;
    if (department) filter.department = department;

    const programs = await Program.find(filter)
      .populate('department')
      .populate('institution')
      .populate('academicYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      programs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('department')
      .populate('institution')
      .populate('academicYear');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.status(200).json({
      success: true,
      program,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { quotas, totalIntake } = req.body;

    if (quotas && totalIntake) {
      const totalQuotaSeats = quotas.reduce((sum, q) => sum + q.seats, 0);
      if (totalQuotaSeats !== totalIntake) {
        return res.status(400).json({
          success: false,
          message: `Total quota seats (${totalQuotaSeats}) must equal total intake (${totalIntake})`,
        });
      }
    }

    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['department', 'institution', 'academicYear']);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      program,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};