const express = require('express');

const globalHandler = require("./controllers/error.controller")
const app = express();

app.use(globalHandler)

module.exports = app;