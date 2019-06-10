var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');

var mongoose = require('mongoose');
var db = require('../db/connection');
var Model = require('../db/schema');


// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender('AAAATynaR9w:APA91bEWR3gWPvNCJYlUVBMtz7xCR4vNn0-tXGgk5O_LPd3Ksq9kYpJsh99noQPoVZx47tLjggyuwFxf8Y0B15afadKgt013yJKCVvlHErRnq5yRdh9n7F7v-EE0od42-A4sFlIRIFex');

//Saving Device tokens...
router.post('/savedevicetoken', function(req, res, next) {
    Model.AppDevices.find({ registrationToken: req.body.registrationToken }, function(err, userDevice) {
        if (userDevice.length) {

            res.send("Already device exists");
        } else {
            Model.AppDevices.remove({ deviceId: req.body.deviceId }, function() {
                console.log("Removed DeviceId");
            });
            Model.AppDevices.create(req.body, function(err, userDevice) {
                if (err) throw err;
                res.send(userDevice);
            });
        }
    });
});

//Send Push Notificationto all device tokens...
router.get('/push', function(req, res, next) {
    res.render("push");
});
//Send Push Notificationto all device tokens...
router.post('/sendpush', function(req, res, next) {
    var registrationTokens = [];
    console.log("SEND PUSH");
    //get All the devices and send the notifications
    var onlyTailors = (req.body.onlyTailors != undefined && req.body.onlyTailors != null) ? req.body.onlyTailors : false;
    var onlyDesigners = (req.body.onlyDesigners != undefined && req.body.onlyDesigners != null) ? req.body.onlyDesigners : false;
    var findData;
    if (onlyTailors) {
        findData = {
            isTailor: true
        }
    } else if (onlyDesigners) {
        findData = {
            isDesigner: true
        }
    } else {
        findData = {}
    }
    console.log("Form Data >>> ", findData);
    Model.AppDevices.find(findData, function(err, userDevice) {
        if (err) throw err;
        console.log("USER DEVICE >>> ", userDevice);
        userDevice.forEach((value, index) => {
            registrationTokens.push(value.registrationToken);
        })
        res.send(userDevice);
    }).then(function() {
        console.log("REGISTER TOKENS >> ", registrationTokens);
        // Prepare a message to be sent
        var message = new gcm.Message({
            priority: 'high',
            //dryRun: true, 
            notification: {
                title: req.body.title,
                icon: "ic_launcher",
                body: req.body.content
            }
        });
        console.log("\n\n Message >>> ", message);
        //specific number of times
        sender.send(message, { registrationTokens: registrationTokens }, function(err, response) {
            if (err) console.log("error >>>", err);
            else console.log("res  ", response);
            res.send(response);
        });


    });

});

module.exports = router;