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
  ENV = process.env.NODE_ENV || 'development',
  BOT_NAME = process.env.BOT_NAME,
  BOT_ALIAS = process.env.BOT_ALIAS;
let botParams = {
  botAlias: BOT_ALIAS,
  botName: BOT_NAME,
  sessionAttributes: {}
};
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

const LEX = new AWS.LexRuntime();
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
 * helper functions
 */
//=============================================================================
function talkToBot(userInput, userID) {
  botParams.inputText = userInput;
  botParams.userId = userID;
  return new Promise((resolve, reject) => {
    return LEX.postText(botParams, function (err, data) {
      if(err) {
        return reject(err);
      } else {
        console.log(`LEX Data`);
        console.log(data);
        return resolve(data.message);
      }
    });
  });
}
//=============================================================================
/**
 * routes
 */
//=============================================================================
app.get('/test', (req, res) => res.status(200).json('ok!'));

app.get('/', (req, res) => {
    const options = {
        root: __dirname,
        dotfiles: 'deny'
    };
    return res.sendFile('index.html', options, err => {
        if(err) {
            console.error(`Couldn't send index.html`);
            return res.status(500).json({error: err});
        } else {
            return console.log('Index.html sent');
        }
    });
});

app.get('/welcome', (req, res) => {
  const welcomeMsg = [
    "Hi, i'm Percy - your PERsonal Champion online. I'm a part of the Percayso family and i'm totally at your service.",
    "I can give you more information about what we do at Percayso or i can help you get the best deals for anything you want using our proprietary technologies to leverage targeted cashback deals just for you!"
  ];
  return res.status(200).json({data: welcomeMsg});
});

app.post('/userInput', (req, res) => {
  const
    userInputData = req.body.userInput,
    userID = req.body.userID;
  console.log('data from user...');
  console.log(userInputData);
  console.log(userID);
  return talkToBot(userInputData, userID)
    .then(data => res.status(200).json({data: data}))
    .catch(err => {
      console.error(err);
      return res.status(500).json({err: err})
    });
});
//=============================================================================
/**
 * bind server
 */
//=============================================================================
server.listen(PORT, () => console.log(`Lex server up on port:${server.address().port} in ${ENV} mode`));
//=============================================================================
