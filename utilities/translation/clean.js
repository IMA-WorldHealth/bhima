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

const i18nRoute = '../../client/src/i18n/en/';

fileNames = getTemplates(initialRoute, [], false);

fileNames.forEach((item) => {
    let fileContent = fs.readFileSync(path.resolve(item), 'utf8');
    let $ = cheerio.load(fileContent);

    $('*[translate]').each((i, elt) => {
        lastElement = elt.children.pop();

        if (lastElement) {
            keyString = lastElement.data;
            if (keyString) {
                en[keyString.split('.')[0]] = removeLastKey(keyString, en);
            }
        }

    });
});

let remainKeys = Object.keys(en).sort();

remainKeys.forEach((key) => {
    key = key.toLowerCase().trim();
    if (key.indexOf('{') === -1 &&
        key.indexOf('}') === -1 &&
        key.indexOf('$') === -1 &&
        key !== '') {
        try {
            console.log('traitement', key, '.json');
            var jsonRoute = path.resolve(__dirname, i18nRoute, key + '.json');
            let obj = require(jsonRoute);
            var list = handle(obj, '', []);
            list.forEach((item) => {
                if (isPresent(item)) {
                    obj[item.split('.')[0]] = removeLastKey(item, obj);
                }
            });

            let objAsString = JSON.stringify(obj);
            var f = fs.openSync(jsonRoute, 'w');
            fs.writeFileSync(f, objAsString, 'utf8');
        }
        catch (e) {

        }
    }


});

function handle(obj, path, res) {
    res = res || [];

    keys = Object.keys(obj).sort();

    keys.forEach((key) => {
        if (typeof obj[key] === 'object') {
            if (path.length > 0) {
                return res.concat(handle(obj[key], path + '.' + key, res));
            } else {
                return res.concat(handle(obj[key], key, res));
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

function getCleanedPropertyList() {
    var properties = Object.getOwnPropertyNames(en);

    return properties.reduce((current, property) => {
        lproperty = property.toLowerCase().trim();
        if (
            lproperty.indexOf('{') === -1 &&
            lproperty.indexOf('}') === -1 &&
            lproperty.indexOf('$') === -1 &&
            lproperty !== '' &&
            current.indexOf(lproperty) === -1) {
            current.push(lproperty);
            return current;
        } else {
            return current;
        }
    }, []);
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