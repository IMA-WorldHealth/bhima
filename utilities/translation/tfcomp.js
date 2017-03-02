// Detect missing translation items between two translation files
// USAGE:  node tfcomp.js f1.json f2.json

'use strict';

const path = require('path');

// get the filenames
const jsonA = process.argv[2];
const jsonB = process.argv[3];

console.log('Comparing', jsonA, jsonB);

// load JSON files
const A = require(path.join(process.cwd(), jsonA));
const B = require(path.join(process.cwd(), jsonB));

// cache the object type
const object = typeof ({});

// Arrays to save differences in
let miss1 = [];
let miss2 = [];

function checkSubDict(d1, d2, path) {
  // Compare the dictionaries recursively
  let i, key, val;

  // Figure out which keys are missing from d1 and d2
  let keys1 = Object.keys(d1).sort();
  let keys2 = Object.keys(d2).sort();
  let missing1 = keys2.filter(function (val) { return keys1.indexOf(val) < 0; });
  let missing2 = keys1.filter(function (val) { return keys2.indexOf(val) < 0; });

  // figure out the common keys
  let common = keys1.filter(function (val) { return keys2.indexOf(val) >= 0; });

  for (i = 0; i < keys2.length; i++) {
    key = keys2[i];
    if (keys1.indexOf(key) >= 0 && common.indexOf(key) < 0) {
    common.push(key);
    }
  }

  common = common.sort();

  // Process the keys missing from d1
  if (missing1.length > 0) {
    for (i = 0; i < missing1.length; i++) {
    if (path.length > 0) {
      miss1.push('  ' + path + '.' + missing1[i]);
    } else {
      miss1.push('  ' + missing1[i]);
    }
    }
  }

  // Process the keys missing from d2
  if (missing2.length > 0) {
    for (i = 0; i < missing2.length; i++) {
      if (path.length > 0) {
      miss2.push('  ' + path + '.' + missing2[i]);
      } else {
      miss2.push('  ' + missing2[i]);
      }
    }
  }

  // Handle common values that are dictionaries (recursively)
  for (i = 0; i < common.length; i++) {
    key = common[i];
    val = d1[key];
    if (typeof (val) === object) {
      if (path.length > 0) {
        checkSubDict(d1[key], d2[key], path + '.' + key);
      } else {
      checkSubDict(d1[key], d2[key], key);
      }
    }
  }
}

// Do the work of comparing the dictionaries
checkSubDict(A, B, '');

let errMsg = '';

// Report items in filename2 but missing from filename1
if (miss1.length > 0) {
  errMsg += '\nMissing from ' + jsonA + ':';
  miss1.sort();
  errMsg += miss1.join('\n');
  errMsg += '\n\n';
}

// Report items in filename1 but missing from filename2
if (miss2.length > 0) {
  errMsg += 'Missing from ' + jsonB + ':';
  miss2.sort();
  errMsg += miss2.join('\n');
}

if (errMsg) {
  console.error(errMsg);
}
