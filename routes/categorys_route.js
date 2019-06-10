var express = require('express');
var router = express.Router();


var multer = require("multer");
var path = require("path");
var fs = require("fs");
var Jimp = require('jimp');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('../db/connection');
var Model = require('../db/schema');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("DEST >> ", file, req.body);
        var date = new Date();
        var catId = req.body.categoryId /* + "_" + date.getMonth() + "_" + date.getFullYear()*/ ;
        fs.mkdir('./public/images/subcategoryImages', err => {
            fs.mkdir('./public/images/subcategoryImages/' + catId, err => {
                cb(null, './public/images/subcategoryImages/' + catId);
            });
        });
    },
    filename: function(req, file, cb) {
        console.log("file name = ", file);
        cb(null, file.fieldname + '-' + Date.now() + ".jpeg");
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(res.end('Only images are allowed'), null)
        }
        callback(null, true)
    }
}).single("file");

/**
 * CATEGORY ROUTE *  
 * default route is category route in this segement.
 */

// Specify which registration IDs to deliver the message to
//var regTokens = ['YOUR_REG_TOKEN_HERE']; 
// create application/json parser 
var jsonParser = bodyParser.json()
router.post('/category', function(req, res) {
        console.log(req.body);
        Model.Category.create(req.body, function(err, category) {
            if (err) throw err;
            //console.log(user);
            res.send(category);
        });
    })
    .get("/categorys", function(req, res) {
        console.log("INSIDE CATEGORY");
        Model.Category.find(function(err, category) {
            if (err) throw err;
            res.send(category);
        });
    })
    .get("/category/:id", function(req, res) {
        console.log("INSIDE CATEGORY");
        Model.Category.find({ "_id": mongoose.Types.ObjectId(req.params.id) }, function(err, category) {
            if (err) throw err;
            res.send(category);
        });
    })
    .put("/category", function(req, res) {
        req.body.id = "59690c84f26ee104fc6e8108";
        console.log("UPDATE ", req.body.id);
        Model.User.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/category", function(req, res) {
        Model.User.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });

/**
 * SUB-CATEGORY ROUTE * 
 */

//Send Push Notificationto all device tokens...
router.get('/html/frontViews', function(req, res, next) {
    res.render("frontViews");
});
//Send Push Notificationto all device tokens...
router.get('/html/bodytype', function(req, res, next) {
    res.render("bodytype");
});
//Send Push Notificationto all device tokens...
router.get('/html/backtype', function(req, res, next) {
    res.render("backtype");
});
//Send Push Notificationto all device tokens...
router.get('/html/clothtype', function(req, res, next) {
    res.render("clothtype");
});
//Send Push Notificationto all device tokens...
router.get('/html/occasiontype', function(req, res, next) {
    res.render("occasiontype");
});
router.post('/frontviewtypes', upload, function(req, res) {
        //req.body.categoryId = mongoose.Types.ObjectId(req.body.categoryId);
        console.log("frontTypes >>> ", req.body, req.file);
        if (req.file == undefined || req.file == null) return res.err("Validation error");
        var frontViewTypes = {
            type: req.body.title,
            desc: req.body.desc,
            categoryId: req.body.categoryId,
            filePath: req.file.path
        }
        console.log("frontViewTypes Details >> ", frontViewTypes);

        Model.FrontViewType.create(frontViewTypes, function(err, frontTypes) {
            if (err) throw err;
            console.log("frontTypes CREATED ", frontTypes);
            res.send(frontTypes);
        });

    })
    .get("/frontviewtypes", function(req, res) {
        Model.FrontViewType.find(function(err, frontTypes) {
            if (err) throw err;
            res.send(frontTypes);
        });
    })
    .put("/frontviewtypes", function(req, res) {
        console.log("UPDATE ", req.body.id);
        Model.FrontViewType.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/frontviewtypes", function(req, res) {
        Model.FrontViewType.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });

module.exports = router;