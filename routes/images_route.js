var express = require('express');
var router = express.Router();

var db = require('../db/connection');
var Model = require('../db/schema');
var multer = require("multer");
var path = require("path");
var fs = require("fs");

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("DEST >> ", file, req.body);
        var date = new Date();
        var subId = req.body.subcategoryId /* + "_" + date.getMonth() + "_" + date.getFullYear()*/ ;
        fs.mkdir('./public/productImages/' + subId, err => {
            cb(null, './public/productImages/' + subId);
        });
    },
    filename: function(req, file, cb) {
        console.log("file name = ", file);
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
}).array("file", 6);

router.post('/uploadImage', function(req, res) {
    console.log("UPLOAD IMAGE >>> ", req.body, req.files)
    upload(req, res, function(uploadError) {
        if (uploadError) {
            console.log(uploadError);
            return res.status(400).send({
                message: 'Error message'
            });
        } else {
            res.json({});
        }
    });
    //res.end("File uploaded sunccessfully");
    /*Model.ProductImages.create(req.body, function(err, bodyType) {
        if (err) throw err;
        //console.log(user);
        res.send(bodyType);
    });*/
})



module.exports = router;