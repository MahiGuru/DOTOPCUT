var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var db = require('../db/connection');
var Model = require('../db/schema');
var XLSX = require('xlsx');


router.post('/excel', function(req, res) {
    //absolute path
    console.log(req.body.filePath);
    var workbook = XLSX.readFile(req.body.filePath);
    var sheet_name_list = workbook.SheetNames;
    console.log(sheet_name_list.length);

    sheet_name_list.forEach(function(y) {
        var worksheet = workbook.Sheets[y];
        var headers = {};
        var data = [];
        for (z in worksheet) {
            if (z[0] === '!') continue;
            //parse out the column, row, and value
            var tt = 0;
            for (var i = 0; i < z.length; i++) {
                if (!isNaN(z[i])) {
                    tt = i;
                    break;
                }
            };
            var col = z.substring(0, tt);
            var row = parseInt(z.substring(tt));
            var value = worksheet[z].v;

            //store header names
            if (row == 1 && value) {
                headers[col] = value;
                continue;
            }

            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
        data.shift();
        console.log(data);
    });
    res.send(data);

});


module.exports = router;