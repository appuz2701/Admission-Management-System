const Applicant = require('../models/Applicant');
const Program = require('../models/Program');

exports.getDashboard = async (req, res) => {
  try {
    const { institution, program } = req.query;

    let programFilter = {};
    let applicantFilter = {};

    if (institution) {
      programFilter.institution = institution;
      applicantFilter.institution = institution;
    }

    if (program) {
      programFilter._id = program;
      applicantFilter.program = program;
    }

    // Get programs with quota status
    const programs = await Program.find(programFilter)
      .populate('department')
      .populate('institution')
      .populate('academicYear');

    // Get applicant stats
    const allApplicants = await Applicant.find(applicantFilter);
    const admitted = await Applicant.countDocuments({ ...applicantFilter, status: 'Admitted' });
    const allotted = await Applicant.countDocuments({ ...applicantFilter, status: 'Allotted' });
    const rejected = await Applicant.countDocuments({ ...applicantFilter, status: 'Rejected' });
    const applied = await Applicant.countDocuments({ ...applicantFilter, status: 'Applied' });
    const pendingDocuments = await Applicant.countDocuments({
      ...applicantFilter,
      documentStatus: { $ne: 'Verified' },
    });
    const pendingFees = await Applicant.countDocuments({ ...applicantFilter, feeStatus: 'Pending' });

    // Calculate quota-wise stats
    const quotaStats = {};
    programs.forEach(prog => {
      prog.quotas.forEach(quota => {
        if (!quotaStats[quota.name]) {
          quotaStats[quota.name] = {
            total: 0,
            filled: 0,
            remaining: 0,
          };
        }
        quotaStats[quota.name].total += quota.seats;
        quotaStats[quota.name].filled += quota.filled;
        quotaStats[quota.name].remaining =
          quotaStats[quota.name].total - quotaStats[quota.name].filled;
      });
    });

    // Category-wise stats
    const categoryStats = {};
    const categoryData = await Applicant.aggregate([
      { $match: applicantFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          admitted: {
            $sum: { $cond: [{ $eq: ['$status', 'Admitted'] }, 1, 0] },
          },
        },
      },
    ]);

    categoryData.forEach(item => {
      categoryStats[item._id] = {
        total: item.count,
        admitted: item.admitted,
      };
    });

    // Status-wise stats
    const statusStats = await Applicant.aggregate([
      { $match: applicantFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCapacity = programs.reduce((sum, p) => sum + p.totalIntake, 0);
    const totalAdmitted = programs.reduce((sum, p) => sum + p.totalFilled, 0);

    res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalPrograms: programs.length,
          totalApplicants: allApplicants.length,
          totalCapacity,
          totalAdmitted,
          remainingCapacity: totalCapacity - totalAdmitted,
          fillingPercentage: totalCapacity > 0 ? ((totalAdmitted / totalCapacity) * 100).toFixed(2) : 0,
        },
        status: {
          applied,
          allotted,
          admitted,
          rejected,
          pendingDocuments,
          pendingFees,
        },
        quotaStats,
        categoryStats,
        statusStats,
        programStats: programs.map(p => ({
          id: p._id,
          name: p.name,
          code: p.code,
          department: p.department?.name,
          courseType: p.courseType,
          totalIntake: p.totalIntake,
          totalFilled: p.totalFilled,
          remainingSeats: p.totalIntake - p.totalFilled,
          fillingPercentage: ((p.totalFilled / p.totalIntake) * 100).toFixed(2),
          quotas: p.quotas,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};