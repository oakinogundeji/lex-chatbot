'use strict';
//=============================================================================
/**
 * variables
 */
//=============================================================================
const respArray = [
  'Howdy',
  'Hi',
  'Good day',
  'Hello',
  'How may i serve you?'
];
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
//=============================================================================
/**
 * handler
 */
//=============================================================================
exports.handler = (event, context, callback) => {
    return callback(null, {
      "dialogAction": {
        "type": "ElicitIntent",
        "message": {
          "contentType": "PlainText",
          "content": generateResponse()
        }
      }
    });
};
//=============================================================================
