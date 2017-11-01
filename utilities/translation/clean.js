/**
 * This script cleans the translation file by scanning templates used in bhima 
 * to find all used translation key and removes all used key in other to reduce 
 * the size of the file.
 * 
 * You should have th enpm module cheerio installed so do npm install
 * 
 * To run the script run : npm run clean-i18n
 * 
 * TO DO : the script is considering only the en.json file, we should include also fr.json
 **/

// We will need file functionnalities to access every template content 
const fs = require('fs');

// To manupilate routes
const path = require('path');

// The big file en.json will be used to determine used/unused translation key
const en = require('../../bin/client/i18n/en.json');

// Used to load and parse template
const cheerio = require('cheerio');

// this route is relative to __dirname variable
const routeToken = '../../client/src/';

// This array will contain files name to process
let fileNames = [];

// Will contain the contend of the fileName[i]
let fileContent = '';

// Storing the selected extension (.html)
const selectedExtension = '.html';

// where we will find the set of file to process
const initialRoute = path.resolve(__dirname, routeToken);

// A route pointing where the small peace of json file for i18n are stored
const i18nRoute = '../../client/src/i18n/en/';

// getting all .html file with their full path
fileNames = getTemplates(initialRoute, [], false);

// processing all .html file to isolate every key used in the template
fileNames.forEach((item) => {
    // fetching the content of the file and store it to fileContent
    let fileContent = fs.readFileSync(path.resolve(item), 'utf8');

    // Loading the template with cheerio
    let $ = cheerio.load(fileContent);

    // looking for every element containing the attribute translate
    $('*[translate]').each((i, elt) => {
        lastElement = elt.children.pop();

        if (lastElement) {
            // will return the key string of the form KEY1.KEY2.KEY3 found in the .html file
            keyString = lastElement.data;

            if (keyString) {

                // removing the last key and reassign the object to the original one
                en[keyString.split('.')[0]] = removeLastKey(keyString, en);
            }
        }

    });
});

// Now the en object will contain only used key, the next step is trying to remove them safely and through this script
let remainKeys = Object.keys(en).sort();

remainKeys.forEach((key) => {
    // transforming to lower case every key and removing unuseful spaces
    key = key.toLowerCase().trim();

    // Evoiding dealing with value parsed in angular format and other
    if (key.indexOf('{') === -1 &&
        key.indexOf('}') === -1 &&
        key.indexOf('$') === -1 &&
        key !== '') {
        try {
            console.log('Processing', key, '.json', '...');
            var jsonRoute = path.resolve(__dirname, i18nRoute, key + '.json');

            //loading the small json file used for developpement
            let obj = require(jsonRoute);

            // for every i18n json file, this function will return an array of keyString with the format : KEY1.KEY2.KEY3
            var list = getAllKeyString(obj, '', []);

            //processing every single key string
            list.forEach((item) => {
                // return true if the key string is present in the object containing data to remove (en.json)
                if (isPresent(item)) {

                    //if true, the last key is removed from the small json file obj
                    obj[item.split('.')[0]] = removeLastKey(item, obj);
                }
            });

            // stringify the object in order to write with utf8 encoding
            const objAsString = JSON.stringify(obj);
            const f = fs.openSync(jsonRoute, 'w');

            // Writting  a new content into the small json file i18n
            fs.writeFileSync(f, objAsString, 'utf8');
        }
        catch (e) {
            //FIX ME : in case require can not find the file, how can I handle it properly?
        }
    }
});

function getAllKeyString(obj, path, res) {
    res = res || [];

    keys = Object.keys(obj).sort();

    keys.forEach((key) => {
        if (typeof obj[key] === 'object') {
            if (path.length > 0) {
                return res.concat(getAllKeyString(obj[key], path + '.' + key, res));
            } else {
                return res.concat(getAllKeyString(obj[key], key, res));
            }
        } else {
            res.push(path.length > 0 ? path + '.' + key : key);
        }

    });

    return res
}

function getTemplates(route, res) {
    res = res || [];

    if (fs.lstatSync(route).isDirectory()) {
        fs.readdirSync(route).forEach((file) => {
            return res.concat(getTemplates(path.resolve(route, file), res));
        });
    } else if (!fs.lstatSync(route).isDirectory() && path.extname(route) === selectedExtension) {
        res.push(route);
    }

    return res;
}

function removeLastKey(keyString, baseObejct) {
    let keys;
    keys = keyString.split('.');

    return keys.reduce((current, next) => {
        if (baseObejct[next]) {
            return current[next] = baseObejct[next];
        } else {
            if (typeof current[next] === 'string') {
                delete current[next];
                return current;
            } else {
                return current;
            }
        }

    }, {});
}

function isPresent(keyString) {
    let found = true;
    let keys = keyString.split('.');
    let currentObj = en;

    for (var i = 0; i < keys.length; i++) {
        currentObj = currentObj[keys[i]];
        if (!currentObj) {
            found = false;
            break;
        }
    }

    return found;
}