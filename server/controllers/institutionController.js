const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');

// Institution Controllers
exports.createInstitution = async (req, res) => {
  try {
    const { name, code, address, city, state, pincode, contactEmail, contactPhone, website } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Institution name and code are required',
      });
    }

    let institution = await Institution.findOne({ code: code.toUpperCase() });
    if (institution) {
      return res.status(400).json({
        success: false,
        message: 'Institution code already exists',
      });
    }

    institution = new Institution({
      name,
      code: code.toUpperCase(),
      address,
      city,
      state,
      pincode,
      contactEmail,
      contactPhone,
      website,
    });

    await institution.save();

    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      institution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: institutions.length,
      institutions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInstitutionById = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    res.status(200).json({
      success: true,
      institution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Campus Controllers
exports.createCampus = async (req, res) => {
  try {
    const { name, code, institution, address, city, state, pincode, contactPerson, contactPhone } = req.body;

    if (!name || !code || !institution) {
      return res.status(400).json({
        success: false,
        message: 'Campus name, code, and institution are required',
      });
    }

    const campus = new Campus({
      name,
      code,
      institution,
      address,
      city,
      state,
      pincode,
      contactPerson,
      contactPhone,
    });

    await campus.save();
    await campus.populate('institution');

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      campus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCampuses = async (req, res) => {
  try {
    const { institution } = req.query;
    const filter = institution ? { institution } : {};
    const campuses = await Campus.find(filter).populate('institution').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campuses.length,
      campuses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Department Controllers
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, institution, campus, head, contactPhone } = req.body;

    if (!name || !code || !institution || !campus) {
      return res.status(400).json({
        success: false,
        message: 'Department name, code, institution, and campus are required',
      });
    }

    const department = new Department({
      name,
      code: code.toUpperCase(),
      institution,
      campus,
      head,
      contactPhone,
    });

    await department.save();
    await department.populate(['institution', 'campus']);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const { institution, campus } = req.query;
    const filter = {};
    if (institution) filter.institution = institution;
    if (campus) filter.campus = campus;

    const departments = await Department.find(filter)
      .populate('institution')
      .populate('campus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};