const { spawn } = require('child_process');
const ROOT = process.argv[2];
const PATHGRABBER = './pathgrabber.js ';
const fs = require('fs');
const path = require('path');
const angular = {
    tsFile: /component.ts/,
} 
const windowsPath = /[A-z0-9:\\-]*/;
/*
    Stores components and associated information in the
    following schema:
        Component_Name : {
            Instability_Value: Some_Number, 
            Abstraction_Value: Some_Number
        }
*/ 
let components = {};


var pathGrabber = function(dir, done) {
    let results = [];
    fs.readdir(dir, function(err, list) {
        if (err) {
            return done(err);
        }
        let pending = list.length;
        if (!pending) { 
            return done(null, results);
        }
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    pathGrabber(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } 
                else {
                    // if file matches component structure
                    fileEnd = file.replace(windowsPath, '');
                    if (fileEnd.match(angular.tsFile)) {
                        results.push(file);
                        if (!--pending) { 
                            done(null, results);
                        }
                    }
                }
                console.log(results);
            });
        });
    });
}

pathGrabber(ROOT, function(err, results) {
    if (err) throw err;
    console.log(results);
});