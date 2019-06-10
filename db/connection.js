//var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/topcut');
mongoose.connect('mongodb://topcut:topcut@ds155201.mlab.com:55201/topcut')

var db = mongoose.connection;

var Model = require('./schema');

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function() {
    console.log("MONGO Connected");
});