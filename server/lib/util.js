var util = require('util');

function toMysqlDate (dateString) {
  // This style of convert to MySQL date avoids changing
  // the prototype of the global Date object
  if (!dateString) { return new Date().toISOString().slice(0, 10); }

  var date = new Date(dateString),
    year = String(date.getFullYear()),
    month = String(date.getMonth() + 1),
    day = String(date.getDate());

  month = month.length < 2 ? '0' + month : month;
  day = day.length < 2 ? '0' + day : day;

  return [year, month, day].join('-');

}

module.exports = {
  toMysqlDate : util.deprecate(toMysqlDate, 'util.toMysqlDate() is deprecated and will be removed soon.  Please use db.js\'s native date parsing.')
};
