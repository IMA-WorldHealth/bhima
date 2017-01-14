'use strict';

const _ = require('lodash');
const db = require('./db');

const RESERVED_KEYWORDS = ['limit', 'detailed'];
const DEFAULT_LIMIT_KEY = 'limit';
const DEFAULT_UUID_PARTIAL_KEY = 'uuid';
/**
 * @class FilterParser
 *
 * @description
 * This library provides a uniform interface for processing filter `options`
 * sent from the client to server controllers.
 * It providers helper methods for commonly request filters like date restrictions
 * and standardises the conversion to valid SQL.
 *
 * It implements a number of built in 'Filter Types' that allow column qurries
 * to be formatted for tasks that are frequently required.
 *
 * Supported Filter Types:
 * * text - search for text contained within a text field
 * * dateFrom - limit the querry to records from a date
 * * dateTo - limit the querry to records up until a date
 *
 *
 * @requires lodash
 * @requires db
 */
class FilterParser {
  // options that are used by all routes that shouldn't be considered unique filters

  // potentially take in config -> { tableAlias : 'q' }; defaults to q or something
  constructor(filters, options) {
    // stores for processing options
    this._statements = [];
    this._parameters = [];

    this._filters = _.clone(filters);

    // configure default options
    this._tableAlias = options.tableAlias || '';
    this._limitKey = options.limitKey || DEFAULT_LIMIT_KEY;
    this._parseUuids = options.parseUuids || true;
  }

  /**
   * @method text
   *
   * @description
   * filter by text value, searches for value anywhere in the database attribute
   * alias for _addFilter method
   *
   * @param {String} column column name to search on
   * @param {String} value value to search for
   */
  fullText(column, filterKey) {
    let valueKey = filterKey || column;

    if (this._filters[valueKey]) {
      let searchString = `%${this._filters[valueKey]}%`;
      let preparedStatement = `LOWER(${this._tableAlias}.${column}) LIKE ? `;

      this._addFilter(preparedStatement, searchString);
      delete this._filters[valueKey];
    }
  }

  /**
   * @method dateFrom
   *
   * @description
   *
   * An filterKey can be used to override what the method expects to recieve, this
   * will default to the column name.
   *
   * if the value must be used again the removal can be enabled/ suppressed with the
   * removeValue flag.
   */
  dateFrom(column, filterKey) {
    let valueKey = filterKey || column;

    if (this._filters[valueKey]) {
      let preparedStatement = `DATE(${this._tableAlias}.${column}) >= DATE(?)`;
      this._addFilter(preparedStatement, this._filters[valueKey]);

      delete this._filters[valueKey];
    }
  }

  dateTo(column, filterKey) {
    let valueKey = filterKey || column;

    if (this._filters[valueKey]) {
      let preparedStatement = `DATE(${this._tableAlias}.${column}) <= DATE(?)`;

      this._addFilter(preparedStatement, this._filters[valueKey]);
      delete this._filters[valueKey];
    }
  }

  custom(column, preparedStatement, preparedValue) {
    if (this._filters[column]) {
      let searchValue = preparedValue || this._filters[column];

      this._addFilter(preparedStatement, searchValue);
      delete this._filters[column];
    }
  }

  applyQuery(sql) {
    // optionally call utility method to parse all remaining options as simple
    // equality filters into `_statements`
    this._parseDefaultFilters();
    let conditionStatements = this._parseStatements();
    let limitCondition = this._parseLimit();

    return `${sql} WHERE ${conditionStatements} ${limitCondition}`;
  }

  parameters() {
    return this._parameters;
  }

  /**
   * @method _addFilter
   *
   * @description
   * Private method - populates the private statement and parameter variables
   */
  _addFilter(statement, parameter) {
    this._statements.push(statement);
    this._parameters.push(parameter);
  }

  /**
   * @method _parseDefaultFilters
   *
   * @description
   * Utility method for parsing any filters passed to the search that do not
   * have filter types - these always check for equality
   */
  _parseDefaultFilters() {

    // remove options that represent reserved keys
    this._filters = _.omit(this._filters, RESERVED_KEYWORDS);

    _.each(this._filters, (value, key) => {
      let valueString = '?';

      if (this._parseUuids) {
        // check to see if key contains the text uuid - if it does and parseUuids has
        // not been supressed, automatically parse the value as binary
        if (key.includes(DEFAULT_UUID_PARTIAL_KEY)) {
          valueString = 'HUID(?)';
        }
      }

     this._addFilter(`${this._tableAlias}.${key} = ${valueString}`, value);
    });
  }

  _parseStatements() {
    // this will always return true for a condition statement
    const DEFAULT_NO_STATEMENTS = '1';
    return _.isEmpty(this._statements) ? DEFAULT_NO_STATEMENTS :this._statements.join(' AND ');
  }

  _parseLimit() {
    let limitString = ''
    let limit = Number(this._filters[this._limitKey]);

    if (limit) {
      limitString = `LIMIT ${limit} `;
    }
    return limitString;
  }
}

module.exports = FilterParser;
