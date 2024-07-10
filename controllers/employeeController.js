const Employee = require('../models/Employee');
const mongoose = require('mongoose');
const Department = require('../models/Department');
const EmployeeProjectTrack = require('../models/EmployeeProjectTrack');
const { employeeValidation } = require('../utils/validate');

// Add Employee
// exports.addEmployee = async (req, res) => {
//   const { error } = employeeValidation(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   try {
//     const { fName, lName, departmentID, onBoardDate, age } = req.body;

//     const department = await Department.findById(departmentID);
//     if (!department) return res.status(400).send('Invalid Department ID');

//     const employeeCount = await Employee.countDocuments();
//     const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;

//     const newEmployee = new Employee({
//       employeeId,
//       fName,
//       lName,
//       departmentID,
//       onBoardDate,
//       age
//     });

//     await newEmployee.save();
//     res.status(201).send(newEmployee);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// };

exports.addEmployee = async (req, res) => {
  const { error } = employeeValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const { fName, lName, departmentID, onBoardDate, age } = req.body;

    // Log the departmentID for debugging
    console.log(`Received departmentID: ${departmentID}`);

    // Check if departmentID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentID)) {
      return res.status(400).send('Invalid Department ID format');
    }

    // Convert departmentID to ObjectId
    const departmentObjectId = mongoose.Types.ObjectId(departmentID);

    const department = await Department.findById(departmentObjectId);
    if (!department) return res.status(400).send('Invalid Department ID');

    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;

    const newEmployee = new Employee({
      employeeId,
      fName,
      lName,
      departmentID: departmentObjectId,
      onBoardDate,
      age
    });

    await newEmployee.save();
    res.status(201).send(newEmployee);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get All Employees with Filters
exports.getAllEmployees = async (req, res) => {
  const { employeeId, searchquery } = req.query;

  try {
    const filter = { isDeleted: false };

    if (employeeId) {
      filter.employeeId = employeeId;
    } else if (searchquery) {
      filter.$or = [
        { fName: { $regex: searchquery, $options: 'i' } },
        { lName: { $regex: searchquery, $options: 'i' } },
        { employeeId: { $regex: searchquery, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter)
      .populate('departmentID', 'departmentId name')
      .exec();

    const results = await Promise.all(employees.map(async (employee) => {
      const projectTracks = await EmployeeProjectTrack.find({ employeeId: employee._id })
        .populate('projectId', 'projectId name')
        .exec();

      const currentlyWorkingProject = projectTracks.find(track => !track.exit);

      return {
        employeeId: employee.employeeId,
        employeeName: `${employee.fName} ${employee.lName}`,
        departmentId: employee.departmentID.departmentId,
        departmentName: employee.departmentID.name,
        currentlyWorkingProject: currentlyWorkingProject ? {
          projectId: currentlyWorkingProject.projectId.projectId,
          projectName: currentlyWorkingProject.projectId.name
        } : null
      };
    }));

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get Employees by Department
exports.getEmployeesByDepartment = async (req, res) => {
  const { departmentId } = req.query;

  try {
    const department = await Department.findOne({ departmentId });
    if (!department) return res.status(400).send('Invalid Department ID');

    const employees = await Employee.find({ departmentID: department._id, isDeleted: false });

    const results = employees.map(employee => ({
      departmentId: department.departmentId,
      departmentName: department.name,
      employeeId: employee.employeeId,
      employeeName: `${employee.fName} ${employee.lName}`
    }));

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get Employees by Project
exports.getEmployeesByProject = async (req, res) => {
  const { projectId } = req.query;

  try {
    const projectTracks = await EmployeeProjectTrack.find()
      .populate('projectId', null, { projectId })
      .populate('employeeId', null, { isDeleted: false })
      .exec();

    const results = projectTracks.map(track => ({
      employeeId: track.employeeId.employeeId,
      employeeName: `${track.employeeId.fName} ${track.employeeId.lName}`,
      projectId: track.projectId.projectId,
      projectName: track.projectId.name,
      WorkingFrom: track.joined
    }));

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get Employees Working in Specific Period
exports.getEmployeesByPeriod = async (req, res) => {
  const { startDate, endDate, projectId } = req.query;

  try {
    const projectTracks = await EmployeeProjectTrack.find({
      projectId: (await Project.findOne({ projectId }))._id,
      joined: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate('employeeId', null, { isDeleted: false })
      .exec();

    const results = projectTracks.map(track => ({
      employeeId: track.employeeId.employeeId,
      employeeName: `${track.employeeId.fName} ${track.employeeId.lName}`,
      projectId: projectId,
      WorkingFrom: track.joined
    }));

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get Average Age of All Departments
exports.getAverageAgeByDepartment = async (req, res) => {
  try {
    const departments = await Department.find().exec();

    const results = await Promise.all(departments.map(async (department) => {
      const employees = await Employee.find({ departmentID: department._id, isDeleted: false }).exec();
      const avgAge = employees.reduce((sum, emp) => sum + emp.age, 0) / employees.length;

      return {
        departmentId: department.departmentId,
        departmentName: department.name,
        avg_age: avgAge
      };
    }));

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete Employee (Soft Delete)
exports.deleteEmployee = async (req, res) => {
  const { employeeId } = req.query;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(400).send('Invalid Employee ID');

    employee.isDeleted = true;
    await employee.save();

    res.status(200).send('Employee deleted successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
