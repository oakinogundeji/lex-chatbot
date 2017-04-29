'use strict';
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
          "content": "I can give you more information about what we do at Percayso or i can help you get the best deals for anything you want using our proprietary technologies to leverage targeted cashback deals just for you!"
        }
      }
    });
};
//=============================================================================
