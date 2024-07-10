const Project = require('../models/Project');
const EmployeeProjectTrack = require('../models/EmployeeProjectTrack');
const Employee = require('../models/Employee');
const { projectValidation, projectTrackValidation } = require('../utils/validate');

// Add Project-wise Employee Tracking
exports.addProjectTracking = async (req, res) => {
  const { error } = projectTrackValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const { projectId, employeeId, joined, exit } = req.body;

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(400).send('Invalid Project ID');

    const employee = await Employee.findOne({ employeeId, isDeleted: false });
    if (!employee) return res.status(400).send('Invalid Employee ID');

    const newTrack = new EmployeeProjectTrack({
      projectId: project._id,
      employeeId: employee._id,
      joined,
      exit
    });

    await newTrack.save();
    res.status(201).send(newTrack);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
