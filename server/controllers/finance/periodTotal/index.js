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

exports.getAccountBalance = getAccountBalance;

/**
 * @function getAccountBalance
 * 
 * @description take a list of period ids and an object called options
 * to filter data and send back a list of account with their debit, credit, and balance
 **/
function getAccountBalance (options){
    const filterParser = new FilterParser(options, { tableAlias : 'pt', autoParseStatements : false });
    const subSql = 
        `
        SELECT
         IFNULL(SUM(pt.credit), 0) AS credit, IFNULL(SUM(pt.debit), 0) AS debit, 
         ac.number, ac.label, ac.type_id, ac.is_asset
        FROM 
         period_total AS pt
        JOIN
         account ac ON ac.id = pt.account_id `;

    filterParser.custom('type_id', `ac.type_id IN (${options.type_id})`);
    filterParser.custom('periods', `pt.period_id IN (${options.periods.join(',')})`);
    filterParser.setGroup('GROUP BY pt.account_id');
    const query = filterParser.applyQuery(subSql);

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

    return db.exec(sql);
}

