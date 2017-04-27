'use strict';
require('dotenv').config();
//=============================================================================
/**
 * dependencies
 */
//=============================================================================
const
  express = require('express'),
  bParser = require('body-parser'),
  Promise = require('bluebird'),
  AWS = require('aws-sdk'),
  http = require('http'),
  path = require('path'),
  app = express(),
  server = http.createServer(app);
//=============================================================================
/**
 * variables
 */
//=============================================================================
const
  PORT = process.env.PORT,
  ENV = process.env.NODE_ENV || 'development';
//=============================================================================
/**
 * config
 */
//=============================================================================
if(ENV != 'production') {
  app.use(require('morgan')('dev'));
  require('clarify');
}

AWS.config.update({region: process.env.AWS_REGION});
//=============================================================================
/**
 * middleware pipeline
 */
//=============================================================================
app.use(bParser.json());
app.use(bParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
//=============================================================================
/**
 * routes
 */
//=============================================================================
app.get('/test', (req, res) => res.status(200).json('ok!'));
//=============================================================================
/**
 * bind server
 */
//=============================================================================
server.listen(PORT, () => console.log(`Lex server up on port:${server.address().port} in ${ENV} mode`));
//=============================================================================
