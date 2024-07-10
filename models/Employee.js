const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  employeeId: String,
  fName: String,
  lName: String,
  departmentID: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },
  onBoardDate: Date,
  age: Number,
});

module.exports = mongoose.model('Employee', employeeSchema);
