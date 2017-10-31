/**
 * This script cleans the translation file by scanning templates used in bhima 
 * to find all used translation key and removes all used key in other to reduce 
 * the size of the file.
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

const initialRoute = path.resolve(__dirname, routeToken);

fileNames = getTemplates(initialRoute, [], false);

fileNames.forEach((item) => {
    let fileContent = fs.readFileSync(path.resolve(item), 'utf8');
    let $ = cheerio.load(fileContent);

    $('*[translate]').each((i, elt) => {
        lastElement = elt.children.pop();

        if (lastElement) {
            keyString = lastElement.data;
            if (keyString) {
                // console.log(keyString);
                en[keyString.split('.')[0]] = removeLastKey(keyString, en);
            }
        }

    });
});

console.log(en);

function getTemplates(route, res, end) {
    res = res || [];

    if (fs.lstatSync(route).isDirectory()) {
        fs.readdirSync(route).forEach((file) => {
            return res.concat(getTemplates(path.resolve(route, file), res, false));
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
