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

// cache the object type
const object = typeof ({});

let errMsg = '';

// Arrays to save differences in
let enMissList = null;
let frMissList = null;
let enFileMissList = [];
let frFileMissList = [];

const jsonFiles = buildJsonFileArray();

jsonFiles.forEach(function (jsonFile) {

  // Arrays to save differences in
  enMissList = [];
  frMissList = [];

  if(jsonFile.en && jsonFile.fr){

    // load JSON files
    let enTranslateObject = require(jsonFile.en);
    let frTranslateObject = require(jsonFile.fr);

    checkSubDict(enTranslateObject, frTranslateObject, '');
  }else{
    //add to the missed files list
    !jsonFile.en ? enFileMissList.push(jsonFile.fr) : frFileMissList.push(jsonFile.en);
  }


  // Report items in french translation but missing from english translation
  if (enMissList.length > 0) {
    errMsg += '\nMissing from ' + jsonFile.en + ': \n';
    enMIssList.sort();
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

if(enFileMissList.length > 0){
  errMsg += '\n Missing english correspondent file for : \n';
  enFileMissList.sort();
  errMsg += enFileMissList.join('\n');
  errMsg += '\n\n';
}

if(frFileMissList.length > 0){
  errMsg += '\n Missing french correspondent file for : \n';
  frFileMissList.sort();
  errMsg += frFileMissList.join('\n');
  errMsg += '\n\n';
}

if (errMsg) {
  console.error(errMsg);
}

function buildJsonFileArray (){
  let jsonList = [];

  enJsonNames.forEach(function (enJsonName) {
    const ind = frJsonNames.indexOf(enJsonName);
    let item = {
      en : path.resolve(EN_PATH, enJsonName),
      fr : null
    };

    if(ind >= 0) {
      item.fr = path.resolve(FR_PATH, frJsonNames[ind]);
    }

    jsonList.push(item);
  });

  const missedFromEnJsonNames = frJsonNames.filter(function (frJsonName) {
    return enJsonNames.indexOf(frJsonName) < 0;
  });

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
  let i, key, val;
  //
  // Figure out which keys are missing from english translate json file and french
  let enKeys = Object.keys(enTranslateObject).sort();
  let frKeys = Object.keys(frTranslateObject).sort();

  let missingListFromEn = frKeys.filter(function (val) { return enKeys.indexOf(val) < 0; });
  let missingListFromFr = enKeys.filter(function (val) { return frKeys.indexOf(val) < 0; });

  // figure out the common keys
  let common = enKeys.filter(function (val) { return frKeys.indexOf(val) >= 0; });

  //see also at the french file if there is some common keys omitted
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
    if (typeof (val) === object) {
      if (path.length > 0) {
        checkSubDict(enTranslateObject[key], frTranslateObject[key], path + '.' + key);
      } else {
      checkSubDict(enTranslateObject[key], frTranslateObject[key], key);
      }
    }
  }


}

