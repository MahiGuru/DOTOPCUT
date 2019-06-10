var express = require('express');
var router = express.Router();
var async = require('async');

var multer = require("multer");
var path = require("path");
var fs = require("fs");

var Jimp = require('jimp');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('../db/connection');
var Model = require('../db/schema');


var jsonParser = bodyParser.json();
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("DEST >> ", req.body);
        var date = new Date();
        //var subId = req.body.subcategoryId /* + "_" + date.getMonth() + "_" + date.getFullYear()*/ ;
        fs.mkdir('./public/images/productImages', err => {
            fs.mkdir('./public/images/productImages/' + req.body.productId, err => {
                cb(null, './public/images/productImages/' + req.body.productId);
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
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
            return callback('Only images are allowed', null)
        }
        console.log("FILE FILTEWR");
        callback(null, true)
    }
}).array("file", 6);

router.post("/webproduct", function(req, res) {
        var productDetails = {
            title: req.body.title,
            desc: req.body.desc,
            frontViewTypes: req.body.frontViewTypes,
            bodyTypes: req.body.bodyTypes,
            occasionTypes: req.body.occasionTypes,
            clothTypes: req.body.clothTypes,
            backTypes: req.body.backTypes
        }
        console.log(productDetails);
        Model.Products.create(productDetails, function(err, products) {
            if (err) throw err;
            console.log("PRODUCT CREATED ", products);
            res.json(products);
        });
    })
    .post('/webuploadimages', upload, function(req, res) {
        console.log("PRODUCTS >>> ", req.body, req.files);
        var productId = req.body.productId;
        var imgNames = [];
        var pathToFolder = '';

        async.waterfall([
            function(callback) {
                async.filter(req.files, function(file, callback) {
                        imgNames.push(file.filename);
                        var dirpath = file.destination;
                        var folderPath = './productImages/' + productId;
                        fs.mkdir(folderPath, err => {});
                        var filePathName = folderPath + "/" + file.filename;
                        var smFileName = folderPath + "/sm/" + 'sm_' + file.filename;
                        var mdFileName = folderPath + "/md/" + 'md_' + file.filename;
                        var lgFileName = folderPath + "/lg/" + 'lg_' + file.filename;

                        pathToFolder = folderPath;
                        Jimp.read(file.path).then(function(jimg) {
                            // jimg.resize(800, Jimp.AUTO).write(lgFileName); // save
                            // jimg.resize(400, Jimp.AUTO).write(mdFileName); // save
                            // jimg.resize(200, Jimp.AUTO).write(smFileName); // save
                            callback(null, jimg);
                        });
                    },
                    function(err, jimg) {
                        callback(null, jimg);
                        console.log("DONE LOOP");
                    });
            },
            function(products, callback) {
                var imgDetails = {
                    imgNames: imgNames,
                    path: pathToFolder,
                    productId: mongoose.Types.ObjectId(productId),
                }
                Model.ProductImages.create(imgDetails, function(err, prodImages) {
                    if (err) throw err;
                    console.log("PRODUCT IMAGES CREATED ", prodImages);
                    callback(null, products, prodImages);
                });
            }
        ], function(err, products, prodImages) {
            //removing files....
            for (var i = 0; i < req.files.length; i++) {
                //fs.unlink(req.files[i].path);
            }
            res.send(prodImages);
        });
    });


module.exports = router;