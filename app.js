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

function searchEbay(item) {
  let ebaySearchURL = BASE_SEARCH_URL +'?OPERATION-NAME='+ OPERATION_NAME
    +'&SERVICE-VERSION='+ SERVICE_VERSION
    +'&SECURITY-APPNAME='+ SECURITY_APPNAME
    +'&GLOBAL-ID='+ GLOBAL_ID
    +'&RESPONSE-DATA-FORMAT=' + RESPONSE_DATA_FORMAT
    +'&REST-PAYLOAD';
  ebaySearchURL += '&keywords=' + encodeURL(item) +'&paginationInput.entriesPerPage=' + PAGE_PAGINATION;
  return new Promise((resolve, reject) => {
    request
      .get(ebaySearchURL)
      .end(function (err, resp) {
        if(err) {
          console.log('ebay error...');
          console.error(err);
          return reject(err);
        } else {
          console.log('ebay response body');
          if(resp.body.errorMessage) {
            console.log(resp.body.errorMessage.error[0]);
          }
          if(resp.body.findItemsByKeywordsResponse) {
            console.log(resp.body.findItemsByKeywordsResponse.errorMessage.error[0]);
          }
          console.log(resp.body);
          console.log('resp');
          console.log(resp.text);
          const data = JSON.parse(resp.text);
          return resolve(data.findItemsByKeywordsResponse[0].searchResult[0].item[0].primaryCategory[0].categoryName[0]);
        }
      });
  });
}

function searchAmazon(item) {
  const
    endpoint = 'webservices.amazon.co.uk',
    uri = '/onca/xml',
    TIME_STAMP = new Date().toISOString();
  let params = [
      "Service=AWSECommerceService",
      "Operation=ItemSearch",
      "AWSAccessKeyId=" + AWS_API_KEY,
      "AssociateTag=" + AWS_ASSOCIATE_ID,
      "SearchIndex=All",
      "Keywords=" + item,
      "ResponseGroup=ItemAttributes"
    ];
  params.push("Timestamp=" + TIME_STAMP);
  params.sort();
  const encodedParams = params.map(param => {
    const paramArray = param.split('=');
    paramArray[1] = encodeURL(paramArray[1]);
    return paramArray.join('=');
  });
  const
    CANONICAL_STR = encodedParams.join('&'),
    SIGNABLE_STR = "GET\n" + endpoint + "\n" + uri + "\n" + CANONICAL_STR,
    SIGNATURE = crypto.createHmac("sha256", AWS_SECRET).update(SIGNABLE_STR).digest("base64"),
    SIGNED_URL = 'http://' + endpoint + uri +'?'+ CANONICAL_STR +'&Signature='+ encodeURL(SIGNATURE);
  console.log(`SIGNED_URL: ${SIGNED_URL}`);
  return new Promise((resolve, reject) => {
    request
      .get(SIGNED_URL)
      .end(function (err, resp) {
        if(err) {
          console.log(err);
          return reject(err);
        } else {
          const
            jsonResp = parser.toJson(resp.text),
            jsonObj = JSON.parse(jsonResp);
          console.log('JSON Obj:');
          console.log(jsonObj);
          console.log('jsonObj.ItemSearchResponse.Items.Item[0].ItemAttributes');
          console.log(jsonObj.ItemSearchResponse.Items.Item[0].ItemAttributes);
          const
            BRAND = jsonObj.ItemSearchResponse.Items.Item[0].ItemAttributes.Brand,
            PRODUCT_GROUP = jsonObj.ItemSearchResponse.Items.Item[0].ItemAttributes.ProductGroup,
            PRODUCT_TYPE = jsonObj.ItemSearchResponse.Items.Item[0].ItemAttributes.ProductTypeName;
          return resolve(BRAND +' '+ PRODUCT_GROUP +' '+ PRODUCT_TYPE);
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
