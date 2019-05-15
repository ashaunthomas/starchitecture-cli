const { spawn } = require('child_process');
const ROOT = process.argv[2];
const PATHGRABBER = './pathgrabber.js ';
const fs = require('fs');
const path = require('path');
const angular = {
    tsFile: /component.ts/,
} 
const windowsPath = /[A-z0-9:\\-]*/;
var paths = [];
/*
    Stores components and associated information in the
    following schema:
        Component_Name : {
            Instability_Value: Some_Number, 
            Abstraction_Value: Some_Number
        }
*/ 
let components = {};

var walk = function(ROOT, done) {
  var results = [];
  fs.readdir(ROOT, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = ROOT + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else { 
            fileEnd = file.replace(windowsPath, '');
            if (fileEnd.match(angular.tsFile)) {
                results.push(file);
            }
            next();
        }
      });
    })();
  });
};

walk(ROOT, function(err, results) {
    if (err) throw err;
    console.log(results);
});


