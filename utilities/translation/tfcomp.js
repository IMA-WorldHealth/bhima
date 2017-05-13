// Detect missing translation items between translation files
// USAGE:  node tfcomp.js path1 path2
// Where path1 and path2 : path to a folder containing json files of translation

'use strict';

const path = require('path');
const fs = require('fs');

// get the files directory
const pathEn = process.argv[2];
const pathFr = process.argv[3];


const EN_PATH = path.resolve(process.cwd(), pathEn);
const FR_PATH = path.resolve(process.cwd(), pathFr);

const enJsonNames = fs.readdirSync(EN_PATH);
const frJsonNames = fs.readdirSync(FR_PATH);

let errMsg = '';

// Arrays to save differences in
let enMissList = null;
let frMissList = null;
const enFileMissList = [];
const frFileMissList = [];

const jsonFiles = buildJsonFileArray();

jsonFiles.forEach(function (jsonFile) {
  // Arrays to save differences in
  enMissList = [];
  frMissList = [];

  if (jsonFile.en && jsonFile.fr) {
    // load JSON files
    const enTranslateObject = require(jsonFile.en);
    const frTranslateObject = require(jsonFile.fr);

    checkSubDict(enTranslateObject, frTranslateObject, '');
  } else {
    //add to the missed files list
    !jsonFile.en ? enFileMissList.push(jsonFile.fr) : frFileMissList.push(jsonFile.en);
  }


  // Report items in french translation but missing from english translation
  if (enMissList.length > 0) {
    errMsg += '\nMissing from ' + jsonFile.en + ': \n';
    enMissList.sort();
    errMsg += enMissList.join('\n');
    errMsg += '\n\n';
  }

  // Report items in filename1 but missing from filename2
  if (frMissList.length > 0) {
    errMsg += 'Missing from ' + jsonFile.fr + ': \n';
    frMissList.sort();
    errMsg += frMissList.join('\n');
    errMsg += '\n\n';
  }
});

if (enFileMissList.length > 0) {
  errMsg += '\n Missing english correspondent file for : \n';
  enFileMissList.sort();
  errMsg += enFileMissList.join('\n');
  errMsg += '\n\n';
}

if (frFileMissList.length > 0) {
  errMsg += '\n Missing french correspondent file for : \n';
  frFileMissList.sort();
  errMsg += frFileMissList.join('\n');
  errMsg += '\n\n';
}

if (errMsg) {
  console.error(errMsg);
}

function buildJsonFileArray() {
  let jsonList = [];

  enJsonNames.forEach(function (enJsonName) {
    const ind = frJsonNames.indexOf(enJsonName);
    const item = {
      en : path.resolve(EN_PATH, enJsonName),
      fr : null,
    };

    if (ind >= 0) {
      item.fr = path.resolve(FR_PATH, frJsonNames[ind]);
    }

    jsonList.push(item);
  });

  const missedFromEnJsonNames = frJsonNames
    .filter(frJsonName => enJsonNames.indexOf(frJsonName) < 0);

  missedFromEnJsonNames.forEach(function (missedFromEnJsonName) {
    jsonList.push({
      en : null,
      fr : path.resolve(FR_PATH, missedFromEnJsonName)
    });
  });

  return jsonList;
}
function checkSubDict(enTranslateObject, frTranslateObject, path) {

  // Compare the dictionaries recursively
  let i;
  let key;
  let val;

  //
  // Figure out which keys are missing from english translate json file and french
  const enKeys = Object.keys(enTranslateObject).sort();
  const frKeys = Object.keys(frTranslateObject).sort();

  const missingListFromEn = frKeys.filter(value => enKeys.indexOf(value) < 0);
  const missingListFromFr = enKeys.filter(value => frKeys.indexOf(value) < 0);

  // figure out the common keys
  let common = enKeys.filter(value => frKeys.indexOf(value) >= 0);

  // see also at the french file if there is some common keys omitted
  for (i = 0; i < frKeys.length; i++) {
    key = frKeys[i];
    if (enKeys.indexOf(key) >= 0 && common.indexOf(key) < 0) {
      common.push(key);
    }
  }


  common = common.sort();

  // Process the keys missing from d1
  if (missingListFromEn.length > 0) {
    for (i = 0; i < missingListFromEn.length; i++) {
    if (path.length > 0) {
      enMissList.push('  ' + path + '.' + missingListFromEn[i]);
    } else {
      enMissList.push('  ' + missingListFromEn[i]);
    }
    }
  }


  // Process the keys missing from d2
  if (missingListFromFr.length > 0) {
    for (i = 0; i < missingListFromFr.length; i++) {
      if (path.length > 0) {
      frMissList.push('  ' + path + '.' + missingListFromFr[i]);
      } else {
      frMissList.push('  ' + missingListFromFr[i]);
      }
    }
  }

  // Handle common values that are dictionaries (recursively)
  for (i = 0; i < common.length; i++) {
    key = common[i];
    val = enTranslateObject[key];
    if (typeof (val) === 'object') {
      if (path.length > 0) {
        checkSubDict(enTranslateObject[key], frTranslateObject[key], path + '.' + key);
      } else {
        checkSubDict(enTranslateObject[key], frTranslateObject[key], key);
      }
    }
  }


}

