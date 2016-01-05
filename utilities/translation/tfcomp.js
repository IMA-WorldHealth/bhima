// Detect missing translation items between two translation files
//
// USAGE:  node tfcomp.js f1.json f2.json

'use strict';

var fs = require('fs');


// Get the filenames
var filename1 = process.argv[2];
var filename2 = process.argv[3];

console.log('comparing', filename1, filename2);

// Load the data for filename1
var data1 = fs.readFileSync(filename1, 'utf8');
var dict1 = JSON.parse(data1);

// Load the data for filename2
var data2 = fs.readFileSync(filename2, 'utf8');
var dict2 = JSON.parse(data2);

// Arrays to save differences in
var miss1 = [];
var miss2 = [];

var checkSubDict = function (d1, d2, path) {
    // Compare the dictionaries recursively
    var i, key, val;

    // Figure out which keys are missing from d1 and d2
    var keys1 = Object.keys(d1).sort();
    var keys2 = Object.keys(d2).sort();
    var missing1 = keys2.filter(function (val) { return keys1.indexOf(val) < 0; });
    var missing2 = keys1.filter(function (val) { return keys2.indexOf(val) < 0; });

    // Figure out the common keys
    var common = keys1.filter(function (val) { return keys2.indexOf(val) >= 0; });
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
                miss1.push('    ' + path + '.' + missing1[i]);
            }
            else {
                miss1.push('    ' + missing1[i]);
            }
        }
    }

    // Process the keys missing from d2
    if (missing2.length > 0) {
        for (i = 0; i < missing2.length; i++) {
            if (path.length > 0) {
                miss2.push('    ' + path + '.' + missing2[i]);
            }
            else {
                miss2.push('    ' + missing2[i]);
            }
        }
    }

    // Handle common values that are dictionaries (recursively)
    for (i = 0; i < common.length; i++) {
        key = common[i];
        val = d1[key];
        if (typeof(val) === typeof({})) {
            if (path.length > 0) {
                checkSubDict(d1[key], d2[key], path + '.' + key);
                }
            else {
                checkSubDict(d1[key], d2[key], key);
                }
        }
    }
};

// Do the work of comparing the dictionaries
checkSubDict(dict1, dict2, '');

var errMsg = '';

// Report items in filename2 but missing from filename1
if (miss1.length > 0) {
    errMsg += '\nMissing from ' + filename1 + ':';
    miss1.sort();
    for (var i1 = 0; i1 < miss1.length; i1++) {
	errMsg += '\n' + miss1[i1];
    }
    errMsg += '\n\n';
}

// Report items in filename1 but missing from filename2
if (miss2.length > 0) {
    errMsg += 'Missing from ' + filename2 + ':';
    miss2.sort();
    for (var i2 = 0; i2 < miss2.length; i2++) {
	errMsg += '\n' + miss2[i2];
    }
}

if (errMsg) {
    console.error(errMsg);
}
