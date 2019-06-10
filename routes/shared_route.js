var express = require('express');
var router = express.Router();

var db = require('../db/connection');
var Model = require('../db/schema');

var multer = require("multer");
/**
 * PRODUCT IMAGES ROUTE * 
 */
var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/productImages');
        },
        filename: function(req, file, cb) {
            cb(null, file.fieldname + "_" + Date.now() + '.jpg');
        }
    })
    //upload = multer({ dest: "images/" });

var upload = multer({ storage: storage }).array("ifile", 2);
router.post('/productImage', function(req, res) {
        console.log(req.body, req.file, req.files);
        req.files.forEach(function(val, i) {
            var filename = val.filename;
            var fileData = {
                filename: filename,
                productId: req.body.productId
            }
            upload(req, res, function(uploadError) {
                if (uploadError) {
                    return res.status(400).send({
                        message: 'Error message'
                    });
                } else {
                    Model.ProductImages.create(req.body, function(err, productImgs) {
                        if (err) throw err;
                        //console.log(user);
                        res.send(productImgs);
                    });
                }
            });

        })



    })
    .get("/productsImage/:productId", function(req, res) {
        Model.ProductImages.findById({ productId: req.query.productId }, function(err, productImgs) {
            if (err) throw err;
            res.send(productImgs);
        });

    })
    .put("/productsImage", function(req, res) {
        console.log("UPDATE ", req.body.productId);
        Model.ProductImages.update({ productId: req.body.productId }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            res.send(raw);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/productsImage", function(req, res) {
        Model.ProductImages.remove({ productId: req.body.productId }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });


/**
 * RATINGS ROUTE * 
 */

router.post('/ratings', function(req, res) {
        Model.Ratings.create(req.body, function(err, rating) {
            if (err) throw err;
            //console.log(user);
            res.send(rating);
        });
    })
    .get("/ratings", function(req, res) {
        console.log('ProductImages ID');
        Model.Ratings.find({}, function(err, rating) {
            if (err) throw err;
            res.send(rating);
        });
    })
    .get("/ratings/product/:productId", function(req, res) {
        console.log('ProductImages ID', req.params.productId);
        Model.Ratings.find({ 'productId': req.params.productId.toString() }, function(err, rating) {
            if (err) throw err;
            res.send(rating);
        });
    })
    .get("/ratings/user/:userId", function(req, res) {
        console.log('ProductImages ID');
        Model.Ratings.findById({ userId: req.query.userId }, function(err, rating) {
            if (err) throw err;
            res.send(rating);
        });
    })
    .put("/ratings", function(req, res) {
        console.log("UPDATE ", req.body.id);
        Model.Ratings.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/ratings", function(req, res) {
        Model.Ratings.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });

/**
 * LIKES ROUTE * 
 */

router.post('/likes', function(req, res) {
        Model.Likes.create(req.body, function(err, like) {
            if (err) throw err;
            //console.log(user);
            res.send(rating);
        });
    })
    .get("/likes/product/:productId", function(req, res) {
        console.log('ProductImages ID');
        Model.Likes.findById({ productId: req.query.productId }, function(err, like) {
            if (err) throw err;
            res.send(like);
        });
    })
    .get("/likes/user/:userId", function(req, res) {
        console.log('ProductImages ID');
        Model.Likes.findById({ userId: req.query.userId }, function(err, like) {
            if (err) throw err;
            res.send(like);
        });
    })
    .put("/likes", function(req, res) {
        console.log("UPDATE ", req.body.id);
        Model.Likes.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/likes", function(req, res) {
        Model.Likes.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });

/**
 * BODY TYPE IMAGES ROUTE * 
 */

router.post('/bodyTypeImg', function(req, res) {
        Model.BodyTypeImg.create(req.body, function(err, bodyTypeImg) {
            if (err) throw err;
            //console.log(user);
            res.send(bodyTypeImg);
        });
    })
    .get("/bodyTypeImg/:bodyImgId", function(req, res) {
        console.log('ProductImages ID');
        Model.BodyTypeImg.findById({ bodyImgId: req.query.bodyImgId }, function(err, bodyTypeImg) {
            if (err) throw err;
            res.send(bodyTypeImg);
        });
    })
    .put("/bodyTypeImg", function(req, res) {
        console.log("UPDATE ", req.body.id);
        Model.BodyTypeImg.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
        });
    })
    .delete("/bodyTypeImg", function(req, res) {
        Model.BodyTypeImg.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            console.log("removed");
            res.send("Successfully deleted!!");
            // removed!
        });
    });


















module.exports = router;