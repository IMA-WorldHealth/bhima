/* global browser */

/**
 * @overview helpers
 *
 * @description
 * This file contains utilities that are useful in tests, but not specifically
 * tied to forms or modules.
 */
const PATH_REGEXP = /^#!|^#|^!/g;

// gets a random number within the range(0, n)
exports.random = function random(n) {
  return Math.floor(((n) * Math.random()) + 1);
};

// wrapper for browser navigation without reloading the page
exports.navigate = async function navigate(browserPath) {
  const destination = browserPath.replace(PATH_REGEXP, '');
  await browser.setLocation(destination);
};

// Select location in location component
exports.selectLocationLabel = async function selectLocationLabel(label) {
  // select the item of the dropdown menu matching the label
  let searchString = label;
  let labelForRegex = label.replace('(', '\\(');
  labelForRegex = labelForRegex.replace(')', '\\)');

  switch ('contains') {
  case 'exact':
    searchString = new RegExp(`^\\s*${labelForRegex}$`, 'm');
    break;
  case 'fullWord':
    searchString = new RegExp(`\\s+${labelForRegex}(\\s|$)`);
    break;
  case 'accountName':
    searchString = new RegExp(`\\d+\\s+${labelForRegex}\\s+`);
    break;
  default:
  case 'contains':
    searchString = label;
    break;
  }
  return searchString;
};

// get the browser path after the hash
exports.getCurrentPath = async function getCurrentPath() {
  const url = await browser.getCurrentUrl();

  const partial = url.split('#!')[1];
  partial.replace(PATH_REGEXP, '');

  return `#!${partial}`;
};

// shared data
exports.data = {

  // location IDs for the location select component
  locations : [
    {
      location01 : 'Merge Country',
      location02 : 'Merge Province',
      location03 : 'Merge Town 1',
      location04 : 'Merge Township 1',
    },
    {
      location01 : 'République Démocratique du Congo',
      location02 : 'Kinshasa',
      location03 : 'Lukunga',
      location04 : 'Gombe',
    },
    {
      location01 : {
        name : 'United States of America',
        type : 'Pays',
      },
      location02 : {
        name : 'Illinois',
        type : 'État',
      },
      location03 : {
        name : 'Cook, DuPage',
        type : 'Comté',
      },
      location04 : {
        name : 'Chicago',
        type : 'Cité',
      },
    },
  ],
};
