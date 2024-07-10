const mongoose = require('mongoose');

const EmployeeProjectTrackSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  joined: { type: Date, required: true },
  exit: { type: Date }
});

module.exports = mongoose.model('EmployeeProjectTrack', EmployeeProjectTrackSchema);
