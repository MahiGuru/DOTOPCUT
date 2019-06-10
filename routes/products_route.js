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
var XLSX = require('xlsx');

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

/**
 * PRODUCTS ROUTE * 
 */
var imgPath = [];
var imgNames = [];
var pathToFolder = '';
router.post("/mobileproduct", function(req, res) {
        console.log("BODY DATA ", req.body);
        var frontTypes = (req.body.frontViewTypes == "") ? [] : JSON.parse(req.body.frontViewTypes);
        var bodyTypes = (req.body.bodyTypes == "") ? [] : JSON.parse(req.body.bodyTypes);
        var occasionTypes = (req.body.occasionTypes == "") ? [] : JSON.parse(req.body.occasionTypes);
        var clothTypes = (req.body.clothTypes == "") ? [] : JSON.parse(req.body.clothTypes);
        var backTypes = (req.body.backTypes == "") ? [] : JSON.parse(req.body.backTypes);

        var productDetails = {
            title: req.body.title,
            desc: req.body.desc,
            designerName: req.body.designerName,
            designerId: req.body.designerId,
            frontViewTypes: frontTypes,
            bodyTypes: bodyTypes,
            occasionTypes: occasionTypes,
            clothTypes: clothTypes,
            backTypes: backTypes
        }
        console.log("productDetails", productDetails)
        Model.Products.create(productDetails, function(err, products) {
            if (err) throw err;
            console.log("PRODUCT CREATED ", products);
            imgPath = [];
            imgNames = [];
            pathToFolder = '';
            res.send(products);
        });
    })
    .post("/copyImages", upload, function(req, res) {
        // console.log("PRODUCTS >>> ", req.body, req.files);
        async.waterfall([
            function(callback) {
                async.filter(req.files, function(file, callback) {
                    console.log("\n\n\n INSIDE IMAGE >> ", req.body, file);
                    imgNames.push(file.filename);
                    var subId = req.body.subcategoryId;
                    var folderPath = './public/images/productImages/' + req.body.productId;
                    fs.mkdir(folderPath, err => {});
                    var smFileName = folderPath + "/sm/" + 'sm_' + file.filename;
                    var mdFileName = folderPath + "/md/" + 'md_' + file.filename;
                    var lgFileName = folderPath + "/lg/" + 'lg_' + file.filename;

                    pathToFolder = folderPath;
                    console.log(folderPath, file.path);
                    Jimp.read(folderPath + "/" + file.filename).then(function(jimg) {
                        console.log("JIMP", 1);
                        // jimg.resize(800, Jimp.AUTO).write(lgFileName); // save
                        // jimg.resize(400, Jimp.AUTO).write(mdFileName); // save
                        // jimg.resize(200, Jimp.AUTO).write(smFileName); // save
                        callback(null, jimg);
                    });
                    imgPath.push(file.path);

                }, function(err, jimg) {
                    var imgDetails = {
                        imgNames: imgNames,
                        path: './productImages/' + req.body.productId,
                        productId: (typeof req.body.productId != 'string') ? mongoose.Types.ObjectId(req.body.productId) : req.body.productId,
                    }
                    console.log("IMAGES PRODUCT ID ", req.body.productId, mongoose.Types.ObjectId(req.body.productId));
                    Model.ProductImages.find({ productId: mongoose.Types.ObjectId(req.body.productId) }, function(err, productImg) {
                        if (productImg.length >= 1) {
                            Model.ProductImages.update({ productId: mongoose.Types.ObjectId(req.body.productId) }, imgDetails, function(err, prodImages) {
                                if (err) throw err;
                                console.log("PRODUCT IMAGES UPDATED ", prodImages);
                                callback(null, prodImages);
                            });
                        } else {
                            Model.ProductImages.create(imgDetails, function(err, prodImages) {
                                if (err) throw err;
                                console.log("PRODUCT IMAGES CREATED ", prodImages);
                                callback(null, prodImages);
                            });
                        }
                    })

                    // console.log(">>>>>DONE LOOP", err, jimg);
                });
            }
        ], function(err, products, prodImages) {
            // console.log("\n\n\n\n\n\n>>>>>LAST ITEM LOOP", imgNames, req.body.productId);
            //removing files....
            // console.log("Last method \n\n\n\n\n\n", products, prodImages);
            // for (var i = 0; i < req.files.length; i++) {
            //     fs.unlink(req.files[i].path);
            // }
            res.send("WIN");
        });
    })
    /**
     * Products Route only for DESKTOP application......
     */
    .get("/allproducts", function(req, res) {
        Model.Products.aggregate([
            // Unwind the source 
            { $unwind: { path: "$backTypes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$frontViewTypes", preserveNullAndEmptyArrays: true } },
            {
                "$lookup": {
                    "from": "productimages",
                    "localField": "_id",
                    "foreignField": "productId",
                    "as": "productImageObjects"
                }
            },
            { $unwind: { path: "$productImageObjects", preserveNullAndEmptyArrays: true } },
            {
                "$lookup": {
                    "from": "ref_back_type",
                    "localField": "backTypes",
                    "foreignField": "_id",
                    "as": "backObjects"
                }
            },

            { $unwind: { path: "$backObjects", preserveNullAndEmptyArrays: true } },
            // // Do the lookup for Fornt View Types...          
            {
                "$lookup": {
                    "from": "frontviewtypes",
                    "localField": "frontViewTypes",
                    "foreignField": "_id",
                    "as": "frontObjects"
                }
            },
            { $unwind: { path: "$frontObjects", preserveNullAndEmptyArrays: true } },
            //Add set to Objects to the types
            {
                "$group": {
                    "_id": "$_id",
                    "title": { $first: "$title" },
                    "desc": { $first: "$desc" },
                    "productImages": { $addToSet: "$productImageObjects" },
                    "backTypes": { $addToSet: "$backObjects" },
                    "frontViewTypes": { $addToSet: "$frontObjects" }
                }
            }
        ]).exec(function(err, prods) {
            console.log("PRODUCT >> ", err, prods);
            res.send(prods);
        })

    })
    .get("/getproduct/:productId", function(req, res) {

        Model.Products.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.params.productId) } },
            // Unwind the source 
            { $unwind: { path: "$clothTypes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$bodyTypes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$occasionTypes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$backTypes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$frontViewTypes", preserveNullAndEmptyArrays: true } },
            {
                "$lookup": {
                    "from": "productimages",
                    "localField": "_id",
                    "foreignField": "productId",
                    "as": "productImageObjects"
                }
            },
            { $unwind: { path: "$productImageObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Cloth Types...
            {
                "$lookup": {
                    "from": "ref_cloth_type",
                    "localField": "clothTypes",
                    "foreignField": "_id",
                    "as": "clothObjects"
                }
            },
            { $unwind: { path: "$clothObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Body Types...
            {
                "$lookup": {
                    "from": "ref_body_type",
                    "localField": "bodyTypes",
                    "foreignField": "_id",
                    "as": "bodyObjects"
                }
            },
            { $unwind: { path: "$bodyObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Occassion Types...           
            {
                "$lookup": {
                    "from": "ref_occasion_type",
                    "localField": "occasionTypes",
                    "foreignField": "_id",
                    "as": "occasionObjects"
                }
            },
            { $unwind: { path: "$occasionObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Back Types...          
            {
                "$lookup": {
                    "from": "ref_back_type",
                    "localField": "backTypes",
                    "foreignField": "_id",
                    "as": "backObjects"
                }
            },
            { $unwind: { path: "$backObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Fornt View Types...          
            {
                "$lookup": {
                    "from": "frontviewtypes",
                    "localField": "frontViewTypes",
                    "foreignField": "_id",
                    "as": "frontObjects"
                }
            },
            { $unwind: { path: "$frontObjects", preserveNullAndEmptyArrays: true } },
            // Do the lookup for Fornt View Types...          

            //Add set to Objects to the types
            {
                "$group": {
                    "_id": "$_id",
                    "title": { $first: "$title" },
                    "desc": { $first: "$desc" },
                    "productImages": { $addToSet: "$productImageObjects" },
                    "clothTypes": { $addToSet: "$clothObjects" },
                    "bodyTypes": { $addToSet: "$bodyObjects" },
                    "occassionTypes": { $addToSet: "$occasionObjects" },
                    "backTypes": { $addToSet: "$backObjects" },
                    "frontViewTypes": { $addToSet: "$frontObjects" }
                }
            }
        ]).exec(function(err, prods) {
            console.log("PRODUCT >> ", err, prods);
            res.send(prods);
        })

    })
    .get("/productsperpage/:perPage?", function(req, res) {
        var defaultPage = 5;
        var perPage = parseInt(req.params.perPage) || defaultPage;
        var skipLimit = (perPage == defaultPage) ? 0 : (perPage - defaultPage);
        console.log(req.params.perPage, skipLimit, perPage);
        async.waterfall([
            function(callback) {
                Model.Products.find({}).lean().skip(skipLimit).limit(perPage).sort({ "created_at": 1 }).exec(function(err, products) {
                    if (err) throw err;
                    callback(null, products);
                });
            },
            function(products, callback) {
                console.log("\n\n\nSECOND >>> ")
                var resultarr = [];
                async.filter(products, function(product, callback) {
                    Model.Tailor.count({
                        'products': {
                            $in: [
                                mongoose.Types.ObjectId(product._id)
                            ]
                        }
                    }).exec(function(err, items) {
                        console.log("ITEMSSSS >> ", items);
                        product["tailorsCount"] = items;
                        callback(null, product);
                    });
                }, function(err, result) {
                    callback(null, products);
                });
            }
        ], function(err, result) {
            res.send(result);
        });

    })
    .get("/productailors", jsonParser, function(req, res) {
        async.waterfall([
            function(callback) {
                Model.Products.find({}).lean().exec(function(err, products) {
                    if (err) throw err;
                    callback(null, products);
                });
            },
            function(products, callback) {
                console.log("\n\n\nSECOND >>> ")
                var resultarr = [];
                async.filter(products, function(product, callback) {
                    Model.Tailor.count({
                        'products': {
                            $in: [
                                mongoose.Types.ObjectId(product._id)
                            ]
                        }
                    }).exec(function(err, items) {
                        console.log("ITEMSSSS >> ", items);
                        product["tailorsCount"] = items;
                        callback(null, product);
                    });
                }, function(err, result) {
                    callback(null, products);
                });
            }
        ], function(err, result) {
            res.send(result);
        });

    })
    .get("/tailorproducts/:productId", function(req, res) {
        Model.Tailor.find({ "products": { $in: [mongoose.Types.ObjectId(req.body.productId)] } }, function(err, products) {
            res.send(products);
        });
    })
    .get("/products/:productId", function(req, res) {
        Model.Products.findById(req.params.productId, function(err, products) {
            res.send(products);
        });
    })
    .get("/products", function(req, res) {
        Model.Products.find({}, function(err, products) {
            res.send(products);
        });
    })
    .put("/products", function(req, res) {
        console.log("UPDATE ", req.body.id);
        Model.Products.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/products/:productId", function(req, res) {
        Model.Products.remove({ _id: req.params.productId }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });



module.exports = router;