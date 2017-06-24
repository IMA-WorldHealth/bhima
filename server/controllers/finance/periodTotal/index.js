/**
 * The /period_total HTTP API endpoint
 *
 * @module finance/periodTotal/
 *
 * @description This module provides possibility of getting data from the perid total table
 *
 * @requires lib/db
 * @requires FilterParser
 */


const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

exports.getAccountsBalances = getAccountsBalances;
exports.getAccountsBalance = getAccountsBalance;

/**
 * @function getAccountsBalances
 * 
 * @description take an object called options
 * to filter data and send back a list of account with their debit, credit, and balance
 **/
function getAccountsBalances (options){
    const filterParser = new FilterParser(options, { tableAlias : 'pt', autoParseStatements : false });
    const subSql = 
        `
        SELECT
         IFNULL(SUM(pt.credit), 0) AS credit, IFNULL(SUM(pt.debit), 0) AS debit, 
         ac.number, ac.label, ac.type_id, ac.is_asset
        FROM 
         period_total AS pt
        JOIN
         account ac ON ac.id = pt.account_id
        JOIN 
         period p ON p.id = pt.period_id `;

    filterParser.dateFrom('dateFrom', 'start_date', 'p');
    filterParser.dateTo('dateTo', 'end_date', 'p');
    filterParser.custom('type_id', `ac.type_id IN (${options.type_id})`);
    filterParser.setGroup('GROUP BY pt.account_id');

    const query = filterParser.applyQuery(subSql);
    const parameters = filterParser.parameters();

    const sql = 
    `
    SELECT
        t.number, t.label, t.credit, t.debit, 
	    (CASE 
            WHEN t.type_id = 1 THEN credit - debit
		    WHEN t.type_id = 2 THEN debit - credit
		    WHEN t.type_id = 3 THEN IF(t.is_asset = 1, debit - credit, credit - debit)
	    END) AS balance
    FROM (${query}) AS t
    `;

    return db.exec(sql, parameters);
}

/**
 * @function getAccountsBalance
 * 
 * @description take an object called options
 * to filter data and send back a balance of a set of account 
 **/
function getAccountsBalance (options){
    const filterParser = new FilterParser(options, { tableAlias : 'pt', autoParseStatements : false });
    const subSql = 
        `
        SELECT
         IFNULL(SUM(pt.credit), 0) AS credit, IFNULL(SUM(pt.debit), 0) AS debit, 
         ac.number, ac.type_id, ac.is_asset
        FROM 
         period_total AS pt
        JOIN
         account ac ON ac.id = pt.account_id
        JOIN 
         period p ON p.id = pt.period_id `;

    filterParser.dateFrom('dateFrom', 'start_date', 'p');
    filterParser.dateTo('dateTo', 'end_date', 'p');
    filterParser.custom('type_id', `ac.type_id IN (${options.type_id})`);
    filterParser.setGroup('GROUP BY pt.account_id');

    const query = filterParser.applyQuery(subSql);
    const parameters = filterParser.parameters();

    const sql = 
    `
    SELECT
        SUM((CASE 
            WHEN t.type_id = 1 THEN credit - debit
		    WHEN t.type_id = 2 THEN debit - credit
		    WHEN t.type_id = 3 THEN IF(t.is_asset = 1, debit - credit, credit - debit)
	    END)) AS balance
    FROM (${query}) AS t
    `;

    return db.exec(sql, parameters);
}

