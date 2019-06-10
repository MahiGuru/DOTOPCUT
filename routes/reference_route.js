var express = require('express');
var router = express.Router();

var db = require('../db/connection');
var Model = require('../db/schema');
var multer = require("multer");

var path = require("path");
var fs = require("fs");
var Jimp = require('jimp');

var timenow;
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        timenow = '';
        console.log("DEST >> ", file, req.body);
        var date = new Date();
        var type = req.body.title /* + "_" + date.getMonth() + "_" + date.getFullYear()*/ ;
        console.log('type >>> ', type);
        fs.mkdir('./public/images/Types', err => {
            fs.mkdir('./public/images/Types/' + type, err => {
                cb(null, './public/images/Types/' + type);
            });
        });
    },
    filename: function(req, file, cb) {
        console.log("file name = ", file);
        timenow = Date.now();
        cb(null, file.fieldname + '-' + timenow + ".jpeg");
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
 * BODY TYPE ROUTE * 
 */

router.post('/bodyType', upload, function(req, res) {
        if (req.file == undefined || req.file == null) return res.err("Validation error");
        var fileName = req.file.fieldname + '-' + timenow + ".jpeg";
        var bodytypeDetails = {
            type: req.body.type,
            desc: req.body.desc,
            path: './public/images/Types/' + req.body.title + fileName
        }
        Model.BodyType.create(bodytypeDetails, function(err, bodyType) {
            if (err) throw err;
            //console.log(user);
            res.send(bodyType);
        });
    })
    .get("/bodyType", function(req, res) {
        Model.BodyType.find({}, function(err, bodytypes) {
            if (err) throw err;
            res.send(bodytypes);
        });
    })
    .get("/bodyTypeImg", function(req, res) {
        Model.BodyType.find({}, function(err, like) {
            if (err) throw err;
            res.send(like);
        });
    })
    .put("/bodyTypeImg", function(req, res) {
        Model.BodyType.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/bodyTypeImg", function(req, res) {
        Model.BodyType.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });
router.get('/clothtype', function(req, res) {
    Model.ClothType.find(function(err, clothType) {
        if (err) throw err;
        res.send(clothType);
    });
}).post('/clothtype', function(req, res) {
    Model.ClothType.create(req.body, function(err, clothType) {
        if (err) throw err;
        res.send(clothType);
    })
});
router.get('/occasiontype', function(req, res) {
    Model.OccasionType.find({}, function(err, occasionType) {
        if (err) throw err;
        //console.log(user);
        res.send(occasionType);
    });
}).post('/occasiontype', function(req, res) {
    Model.OccasionType.create(req.body, function(err, occasionType) {
        if (err) throw err;
        res.send(occasionType);
    })
});;
router.get('/backtype', function(req, res) {
    Model.BackType.find({}, function(err, backType) {
        if (err) throw err;
        //console.log(user);
        res.send(backType);
    });
}).post('/backtype', upload, function(req, res) {
    if (req.file == undefined || req.file == null) return res.err("Validation error");
    var fileName = req.file.fieldname + '-' + timenow + ".jpeg";
    var backtypeDetails = {
        type: req.body.type,
        desc: req.body.desc,
        path: './public/images/Types/' + req.body.title + fileName
    }
    Model.BackType.create(backtypeDetails, function(err, backType) {
        if (err) throw err;
        res.send(backType);
    })
});;
module.exports = router;