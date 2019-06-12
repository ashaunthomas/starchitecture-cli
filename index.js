const { spawn } = require('child_process');
const ROOT = process.argv[2];
const OUTPUT = process.argv[3];
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
const ACCEPTED_OUTPUTS = {
  log: 'log',
  json: 'json'
};
const windowsPath = /[A-z0-9:\\-]*/;

let fanIn = {};
let fanOut = {};
let json = {};

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
  let fromFile;
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
        let fromFile = ROOT + '/' + wordsArr[searchIndex + 2]
          .replace(/\\/, '.ts')
          .replace(/\'/, '')
          .replace(/./, '')
          .replace(/\//, '');
        fromFile = fromFile.substring(0, fromFile.length - 2) + '.ts';
        fanIn[fromFile] += count;
        //console.log(`fanIn[${fromFile}] = ` + count);
      }
    }
  }
  //console.log(`fanOut[${componentName}] = ` + count);
  fanOut[componentName] = count;
}

function groupLog(title, callback) {
  console.group(title);
  callback();
  console.groupEnd();
}

function initFans(fileName) {
  fanIn[fileName] = 0;
  fanOut[fileName] = 0;
}

function calcAbstractiveness(Na, Nc) {
  if (Nc === 0 || Na === 0) {
    return 0;
  }
  else {
    return (Na / Nc).toFixed(2);
  }
}

function calcInstability(fanIn, fanOut) {
  let divisor = fanIn + fanOut;
  if (divisor === 0 || fanIn === 0) {
    return 0;
  }
  else {
    return fanOut / divisor; 
  }
}

function main() {
  switch(OUTPUT) {
    case ACCEPTED_OUTPUTS.log:
    case undefined:
      runLog();
      break;
    case ACCEPTED_OUTPUTS.json:
      runJson();
      break;
    default:
      console.error("[!] Starchitecture ran with invalid output type: " + OUTPUT);
      console.error("[!] Try 'json' or 'log'");     
  }
}

function runLog() {
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
          console.log('abstractness: ' + calcAbstractiveness(abstractions, totalClasses));
          console.log('fan-in: ' + fanIn[results[i]]);
          console.log('fan-out: ' + fanOut[results[i]]);
          console.log('instability: ' + calcInstability(fanIn[results[i]], fanOut[results[i]]));
          console.groupEnd();
      });  
    }
  });
}

function runJson() {
  walk(ROOT, function(err, results) {
    if (err) throw err;
    for (let i = 0; i < results.length; i++) {
      fs.readFile(results[i], 'utf-8', (err, data) => {
        initFans(results[i]);
        calculateFans(results[i], data);
        let abstractions = getAbstractions(data);
        let totalClasses = getTotalClasses(data);
        let abstractiveness = calcAbstractiveness(abstractions, totalClasses);
        let instability = calcInstability(fanIn[results[i]], fanOut[results[i]]);
        json[results[i]] = {
          i: instability,
          a: abstractiveness
        };
      }); 
    }
    setTimeout(function() {
      console.log(json);
    }, 500);
  });
}

main();