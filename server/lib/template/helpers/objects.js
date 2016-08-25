'use strict';

/**
 * @function look
 * @description look value into an object given
 * @param {object} obj The concerned object
 * @param {string} property The object property
 * @param {string} property2 The object property
 */
function look(obj, property, property2) {
  // Missing parameter take the function name as name property
  // if property2 is missing, it will be an object with an attribute name: 'function name'
  return obj && property && property2 && property2.name ? obj[property] :
    obj && property && property2 && !property2.name ? obj[property][property2] : '' ;
}

exports.look = look;
