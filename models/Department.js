const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  departmentID: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  },
  name: String,
  createdOn: Date,
});

module.exports = mongoose.model('Department', departmentSchema);
