const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.post('/add', employeeController.addEmployee);
router.get('/all', employeeController.getAllEmployees);
router.get('/by-department', employeeController.getEmployeesByDepartment);
router.get('/by-project', employeeController.getEmployeesByProject);
router.get('/by-period', employeeController.getEmployeesByPeriod);
router.get('/average-age', employeeController.getAverageAgeByDepartment);
router.delete('/delete', employeeController.deleteEmployee);

module.exports = router;


