const { spawn } = require('child_process');
const ROOT = process.argv[2];
const PATHGRABBER = './pathgrabber.js ';
const fs = require('fs');
const path = require('path');
const angular = {
    tsFile: /component.ts/,
    interface: 'interface',
    abstraction: 'abstract',
    class: 'class',
    import:'import'
} 
const windowsPath = /[A-z0-9:\\-]*/;

let fanIn = {};
let fanOut = {};

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

function getAbstractions(data) {
  let wordsArr = data
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .split(" ");
  let count = wordsArr.reduce(function(sum, val)  {
    return sum + (val === angular.abstraction || val === angular.interface)
  }, 0);
  return count;
}

function getTotalClasses(data) {
  let wordsArr = data
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .split(" ");
  let count = wordsArr.reduce(function(sum, val)  {
    return sum + (val === angular.class || val === angular.interface)
  }, 0);
  return count;
}

function calculateFans(componentName, data) {
  let wordsArr = data
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .split(" ");
  //console.log(wordsArr);
  let count = 0;
  for(let i = 0; i < wordsArr.length; i++) {
    if (wordsArr[i] === 'import') {
      let searchIndex = i + 2;
      while (wordsArr[searchIndex] !== '}') {
        ++searchIndex;
        ++count;
      }
      if (wordsArr[searchIndex] === '}') {
        let fromFile = ROOT + wordsArr[searchIndex + 2]
          .replace(/\\/, '')
          .replace(/\'/, '')
          .replace(/\//, '');
        fanIn[fromFile] += count;
      }
    }
  }
  fanOut[componentName] = count;
}

function initFans(fileName) {
  fanIn[fileName] = 0;
  fanOut[fileName] = 0;
}

walk(ROOT, function(err, results) {
  if (err) throw err;
  for (let i = 0; i < results.length; i++) {
    fs.readFile(results[i], 'utf-8', (err, data) => {
        initFans(results[i]);
        let abstractions = getAbstractions(data);
        let totalClasses = getTotalClasses(data);
        calculateFans(results[i], data);
        console.group(results[i]);
        console.log('abstractions: ' + abstractions);
        console.log('total: ' + totalClasses);
        console.log('abstractness: ' + abstractions/totalClasses);
        console.log('fan-in: ' + fanIn[results[i]]);
        console.log('fan-out: ' + fanOut[results[i]]);
        console.groupEnd();
    });  
  }
});