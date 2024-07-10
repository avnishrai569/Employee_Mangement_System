const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');

const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);

// Error handling
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch(err => console.log(err));

module.exports = app;
