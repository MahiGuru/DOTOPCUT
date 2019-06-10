var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var db = require('../db/connection');
var Model = require('../db/schema');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/**
 * USER ROUTE * 
 */

router.post('/user', function(req, res) {
        Model.User.create(req.body, function(err, user) {
            if (err) throw err;
            res.send(user);
        });
    })
    .get("/user", function(req, res) {
        Model.User.find(function(err, user) {
            if (err) throw err;
            res.send(user);
        });
    })
    .post('/login', function(req, res) {
        Model.User.find(req.body.user, function(err, user) {
            if (err) return handleError(err);
            res.send(user);
        });
    })
    .put("/user", function(req, res) {
        Model.User.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
        });
    })
    .delete("/user", function(req, res) {
        Model.User.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            res.send("Successfully deleted!!");
            // removed!
        });
    });

/**
 * TAILOR ROUTE * 
 */

router.post('/tailor', function(req, res) {
        Model.Tailor.create(req.body, function(err, tailor) {
            if (err) throw err;
            res.send(tailor);
        });
    })
    .post('/tailor/:id?', function(req, res) {
        var id = mongoose.Types.ObjectId(req.params.id);
        Model.Tailor.update({ _id: id }, { $set: req.body }, { upsert: true }, function(err, tailor) {
            res.send(tailor);
        });
    })
    .get("/tailors", function(req, res) {
        Model.Tailor.find({}, function(err, tailors) {
            if (err) throw err;
            res.send(tailors)
        });
    })
    .get("/tailorscount/:productId", function(req, res) {
        Model.Tailor.count({
            'products': {
                $in: [
                    mongoose.Types.ObjectId(req.params.productId)
                ]
            }
        }, function(err, count) {
            if (err) throw err;
            res.send(count);
        });
    })
    .post("/neartailors", function(req, res) {
        req.params.near = req.params.near || 10000;
        var near = req.body.near || 1000;
        var coords = req.body.coords;
        Model.Tailor.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [coords.latitude, coords.longitude]
                    },
                    $maxDistance: near //1000meters = 1KM
                }
            }
        }, function(err, result) {
            res.send(result);
        });
    })
    .get("/tailorproducts/:tailorId", function(req, res) {
        Model.Tailor.find({ _id: mongoose.Types.ObjectId(req.params.tailorId) })
            .populate("products", "_id title desc bodyTypes").select("products")
            .exec(function(err, items) {
                if (err) throw err;
                res.send(items);
            });
    })
    .get('/listtailors/:tailorId', function(req, res) {
        Model.Tailor.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.params.tailorId) } },
            // Unwind the source 
            { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "products",
                    "foreignField": "_id",
                    "as": "productsObject"
                }
            },
            { $unwind: { path: "$productsObject", preserveNullAndEmptyArrays: true } },
            {
                "$lookup": {
                    "from": "productimages",
                    "localField": "products",
                    "foreignField": "productId",
                    "as": "productImageObjects"
                }
            },
            { $unwind: { path: "$productImageObjects", preserveNullAndEmptyArrays: true } },

            //Add set to Objects to the types
            {
                "$group": {
                    "_id": "$_id",
                    "title": { $first: "$shopname" },
                    "desc": { $first: "$desc" },
                    "listproducts": {
                        $push: {
                            'products': "$productsObject",
                            "productImages": "$productImageObjects"
                        }
                    }
                }
            }
        ]).exec(function(err, prods) {
            res.send(prods);
        });
    })
    .get("/tailoraddproducts", function(req, res) {
        Model.Tailor.find({}, function(err, tailors) {
            var products = [];
            for (i = 0; i < tailors.length; i++) {
                for (j = 0; j < tailors[i].products.length; j++) {
                    products.push(tailors[i].products[j]);
                }
            }
            if (products != undefined && products != null) {
                Model.Products.aggregate([
                    { $match: { _id: { '$nin': products } } },
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
                        "$group": {
                            "_id": "$_id",
                            "title": { $first: "$title" },
                            "desc": { $first: "$desc" },
                            "productImages": { $addToSet: "$productImageObjects" }

                        }
                    }
                ]).exec(function(err, prods) {
                    res.send(prods);
                })

            }

        });

    })
    .post("/itailor/:id", function(req, res) {
        var arr = [];
        Model.Tailor.findById(req.params.id, function(err, tailor) {
            arr = (tailor.products != null && tailor.products != undefined) ? tailor.products : [];
            for (let i = 0; i < req.body.products.length; i++) {
                if (arr.indexOf(mongoose.Types.ObjectId(req.body.products[i])) <= -1) {
                    prod = mongoose.Types.ObjectId(req.body.products[i]);
                    arr.push(prod);
                }
            }
            Model.Tailor.update({ _id: req.params.id }, { products: arr }, { multi: true }, function(err, raw) {
                if (err) throw err;
                res.send("Successfully updated...");
            });
        })

    })
    .delete("/tailor", function(req, res) {
        Model.Tailor.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            res.send("Successfully deleted!!");
            // removed!
        });
    });

/**
 * TAILOR ROUTE * 
 */

router.post('/designers', function(req, res) {
        Model.Designer.create(req.body, function(err, designer) {
            if (err) throw err;
            res.send(designer);
        });
    })
    .post("/neardesigners", function(req, res) {
        req.params.near = req.params.near || 10000;
        var near = req.body.near || 1000;
        var coords = req.body.coords;
        console.log("COORDS >>>>> ", coords);
        Model.Designer.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [coords.latitude, coords.longitude]
                    },
                    $maxDistance: near //1000meters = 1KM
                }
            }
        }, function(err, result) {
            console.log(result);
            res.send(result);
        });
    })
    .post('/uploadproducts', function(req, res) {
        Model.productImages.create(req.body, function(err, designer) {
            if (err) throw err;
            res.send(designer);
        });
    })
    .get("/designers", function(req, res) {
        Model.Designer.find(function(err, designer) {
            if (err) throw err;
            res.send(designer);
        });
    })
    .get("/designerById/:id", function(req, res) {
        Model.Designer.findById(req.params.id, function(err, designer) {
            if (err) throw err;
            res.send(designer);
        });
    })
    .put("/designers", function(req, res) {
        Model.Designer.update({ _id: req.body.id }, req.body.data, { multi: true }, function(err, raw) {
            if (err) return handleError(err);
        });
    })
    .delete("/designers", function(req, res) {
        Model.Designer.remove({ _id: req.body.id }, function(err) {
            if (err) return handleError(err);
            res.send("Successfully deleted!!");
            // removed!
        });
    });

module.exports = router;