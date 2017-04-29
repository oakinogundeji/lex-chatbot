'use strict';
//=============================================================================
/**
 * dependencies
 */
//=============================================================================
const
  Promise = require('bluebird'),
  request = require('superagent'),
  encodeURL = require('urlencode'),
  parser = require('xml2json'),
  _ = require('lodash'),
  crypto = require("crypto");
//=============================================================================
/**
 * variables
 */
//=============================================================================
const
  respArray = [
    'Howdy',
    'Hi',
    'Good day',
    'Hello',
    'How may i serve you?'
  ],
  BASE_SEARCH_URL = process.env.BASE_SEARCH_URL,
  OPERATION_NAME = process.env.OPERATION_NAME,
  SERVICE_VERSION = process.env.SERVICE_VERSION,
  SECURITY_APPNAME = process.env.SECURITY_APPNAME,
  GLOBAL_ID = process.env.GLOBAL_ID,
  RESPONSE_DATA_FORMAT = process.env.RESPONSE_DATA_FORMAT,
  PAGE_PAGINATION = process.env.PAGE_PAGINATION,
  AWS_API_KEY = process.env.AWS_API_KEY,
  AWS_ASSOCIATE_ID = process.env.AWS_ASSOCIATE_ID,
  AWS_SECRET = process.env.AWS_SECRET;
//=============================================================================
/**
 * helper functions
 */
//=============================================================================
function randomChooser() {
  return Math.floor(Math.random()*5);
}

function generateResponse() {
  const val = randomChooser();
  return respArray[val];
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

function generateUniqStr(data) {
  const
    dataStr = data.join(' '),
    dataArr = dataStr.split(' '),
    uniqArr = _.uniq(dataArr),
    finalStr = uniqArr.join(' ');
  return finalStr;
}

function executeSearch(ITEM) {
  console.log(`search item: ${ITEM}`);
  const promiseArray = [searchEbay(ITEM), searchAmazon(ITEM)];
  return Promise.all(promiseArray)
    .then(data => {
      const
        enrichedQuery = generateUniqStr(data),
        ebay = data[0],
        amazon = data[1],
        semantics3 = data[2];
      return [
        'Ebay resp: ' + ebay,
        'Amazon resp:' + amazon,
        'Your enriched query: '+ ITEM +' '+ enrichedQuery
      ];
    })
    .catch(err => err);
}
//=============================================================================
/**
 * handler
 */
//=============================================================================
exports.handler = (event, context, callback) => {
  const ITEM = event.currentIntent.slots.item;
  console.log(`ITEM: ${ITEM}`);
    return callback(null, {
      "dialogAction": {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText",
          "content": executeSearch(ITEM)
        }
      }
    });
};
//=============================================================================
