const _ = require('lodash');

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
 * * equals - a direct comparison
 * * text - search for text contained within a text field
 * * dateFrom - limit the querry to records from a date
 * * dateTo - limit the querry to records up until a date
 *
 * @requires lodash
 * @requires db
 */
class FilterParser {
  // options that are used by all routes that shouldn't be considered unique filters
  constructor(filters, filterOptions) {
    let options = filterOptions || {};

    // stores for processing options
    this._statements = [];
    this._parameters = [];

    this._filters = _.clone(filters) || {};

    // configure default options
    this._tableAlias = options.tableAlias || null;
    this._limitKey = options.limitKey || DEFAULT_LIMIT_KEY;
    this._order = '';
    this._parseUuids = options.parseUuids || true;
  }

  /**
   * @method text
   *
   * @description
   * filter by text value, searches for value anywhere in the database attribute
   * alias for _addFilter method
   *
   * @param {String} filterKey    key attribute on filter object to be used in filter
   * @param {String} columnAlias  column to be used in filter query. This will default to
   *                              the filterKey if not set
   * @param {String} tableAlias   table to be used in filter query. This will default to
   *                              the object table alias if it exists
   */
  fullText(filterKey, columnAlias = filterKey, tableAlias = this._tableAlias) {
    let tableString = this._formatTableAlias(tableAlias);

    if (this._filters[filterKey]) {
      let searchString = `%${this._filters[filterKey]}%`;
      let preparedStatement = `LOWER(${tableString}${columnAlias}) LIKE ? `;

      this._addFilter(preparedStatement, searchString);
      delete this._filters[filterKey];
    }
  }

  /**
   * @method dateFrom
   *
   * @param {String} filterKey    key attribute on filter object to be used in filter
   * @param {String} columnAlias  column to be used in filter query. This will default to
   *                              the filterKey if not set
   * @param {String} tableAlias   table to be used in filter query. This will default to
   *                              the object table alias if it exists
   */
  dateFrom(filterKey, columnAlias = filterKey, tableAlias = this._tableAlias) {
    let tableString = this._formatTableAlias(tableAlias);

    if (this._filters[filterKey]) {
      let preparedStatement = `DATE(${tableString}${columnAlias}) >= DATE(?)`;
      this._addFilter(preparedStatement, new Date(this._filters[filterKey]));

      delete this._filters[filterKey];
    }
  }

  /**
   * @method dateTo
   *
   * @param {String} filterKey    key attribute on filter object to be used in filter
   * @param {String} columnAlias  column to be used in filter query. This will default to
   *                              the filterKey if not set
   * @param {String} tableAlias   table to be used in filter query. This will default to
   *                              the object table alias if it exists
   */
  dateTo(filterKey, columnAlias = filterKey, tableAlias = this._tableAlias) {
    let tableString = this._formatTableAlias(tableAlias);

    if (this._filters[filterKey]) {
      let preparedStatement = `DATE(${tableString}${columnAlias}) <= DATE(?)`;

      this._addFilter(preparedStatement, new Date(this._filters[filterKey]));
      delete this._filters[filterKey];
    }
  }

  equals(filterKey, columnAlias = filterKey, tableAlias = this._tableAlias) {
    let tableString = this._formatTableAlias(tableAlias);

    if (this._filters[filterKey]) {
      let preparedStatement = `${tableString}${columnAlias} = ?`;

      this._addFilter(preparedStatement, this._filters[filterKey]);
      delete this._filters[filterKey];
    }
  }

  /**
   * @method reversed
   *
   * @description
   * 'reversed criteria' currently stands as joining with the voucher table on reference_uuid
   * if a voucher exists for this record it will contain a `type_id`
   *
   * @TODO this is the first example of a 'toggle' filter, this should be more carefully
   * designed
   */
  reversed(filterKey) {
    const REVERSE_VOUCHER_ID = 10;

    if (this._filters[filterKey]) {
      let includeReversed = Boolean(Number(this._filters[filterKey]));
      let preparedStatement = '';

      if (includeReversed) {
        // return only records that meet the reversed criteria
        preparedStatement = `voucher.type_id = ?`;
      } else {
        // exclude all record that meet the reversed criteria
        preparedStatement = `(voucher.type_id IS NULL OR voucher.type_id <> ?)`;
      }

      // using the reversal voucher id as the parameter is a hack, this will be
      // addressed in standardising filters on the server and the client
      this._addFilter(preparedStatement, REVERSE_VOUCHER_ID);
      delete this._filters[filterKey];
    }
  }

  custom(filterKey, preparedStatement, preparedValue) {
    if (this._filters[filterKey]) {
      let searchValue = preparedValue || this._filters[filterKey];

      this._addFilter(preparedStatement, searchValue);
      delete this._filters[filterKey];
    }
  }

  /**
   * @TODO
   * @description
   * Temporary solution to setting ordering on complex querries - this should be
   * exposed through the same interface as all other filters.
   */
  setOrder(orderString) {
    this._order = orderString;
  }

  applyQuery(sql) {
    // optionally call utility method to parse all remaining options as simple
    // equality filters into `_statements`
    let limitCondition = this._parseLimit();
    this._parseDefaultFilters();
    let conditionStatements = this._parseStatements();
    let order = this._order;

    return `${sql} WHERE ${conditionStatements} ${order} ${limitCondition}`;
  }

  parameters() {
    return this._parameters;
  }

  // this method only applies a table alias if it exists
  _formatTableAlias(table) {
    return table ? `${table}.` : '';
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
      let tableString = this._formatTableAlias(this._tableAlias);

      if (this._parseUuids) {
        // check to see if key contains the text uuid - if it does and parseUuids has
        // not been supressed, automatically parse the value as binary
        if (key.includes(DEFAULT_UUID_PARTIAL_KEY)) {
          valueString = 'HUID(?)';
        }
      }
      this._addFilter(`${tableString}${key} = ${valueString}`, value);
    });
  }

  _parseStatements() {
    // this will always return true for a condition statement
    const DEFAULT_NO_STATEMENTS = '1';
    return _.isEmpty(this._statements) ? DEFAULT_NO_STATEMENTS :this._statements.join(' AND ');
  }

  _parseLimit() {
    let limitString = '';
    let limit = Number(this._filters[this._limitKey]);

    if (limit) {
      limitString = `LIMIT ${limit} `;
    }

    return limitString;
  }
}

module.exports = FilterParser;
