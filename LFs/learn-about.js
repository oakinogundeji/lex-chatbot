'use strict';
//=============================================================================
/**
 * variables
 */
//=============================================================================
const respArray = [
  "At Percayso, we empower individuals to take control of their personal information online to get the things they want, if they want them, how they want them and when they want them! To learn more about us, please visit http://www.percayso.com/what-is-percayso",
  "Percayso is focused on the individual internet-using consumer, who rightly feels frustrated and concerned by the proliferation of personal information held by enterprises and organisations who target them with unsolicited marketing and advertising. By providing consumers with the tools and means to take back control of, deploy, shield and secure their personal information, Percayso aims to be a true champion of the individual. To learn more about us, please visit http://www.percayso.com/what-is-percayso"
];
//=============================================================================
/**
 * helper functions
 */
//=============================================================================
function randomChooser() {
  return Math.floor(Math.random()*2);
}

function generateResponse() {
  const val = randomChooser();
  return val < 1 ? respArray[0] : respArray[1];
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
