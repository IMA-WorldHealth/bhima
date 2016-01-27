var sanitize = require('./db').sanitize,
    util = require('./util');

// TODO should this go here?
// all mysql reserved words
var reservedWords = [
  'ADD',
  'ALL',
  'ALTER',
  'ANALYZE',
  'AND',
  'AS',
  'ASC',
  'ASENSITIVE',
  'BEFORE',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BLOB',
  'BOTH',
  'BY',
  'CALL',
  'CASCADE',
  'CASE',
  'CHANGE',
  'CHAR',
  'CHARACTER',
  'CHECK',
  'COLLATE',
  'COLUMN',
  'CONDITION',
  'CONSTRAINT',
  'CONTINUE',
  'CONVERT',
  'CREATE',
  'CROSS',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'CURSOR',
  'DATABASE',
  'DATABASES',
  'DAY_HOUR',
  'DAY_MICROSECOND',
  'DAY_MINUTE',
  'DAY_SECOND',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DELAYED',
  'DELETE',
  'DESC',
  'DESCRIBE',
  'DETERMINISTIC',
  'DISTINCT',
  'DISTINCTROW',
  'DIV',
  'DOUBLE',
  'DROP',
  'DUAL',
  'EACH',
  'ELSE',
  'ELSEIF',
  'ENCLOSED',
  'ESCAPED',
  'EXISTS',
  'EXIT',
  'EXPLAIN',
  'FALSE',
  'FETCH',
  'FLOAT',
  'FLOAT4',
  'FLOAT8',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FROM',
  'FULLTEXT',
  'GRANT',
  'GROUP',
  'HAVING',
  'HIGH_PRIORITY',
  'HOUR_MICROSECOND',
  'HOUR_MINUTE',
  'HOUR_SECOND',
  'IF',
  'IGNORE',
  'IN',
  'INDEX',
  'INFILE',
  'INNER',
  'INOUT',
  'INSENSITIVE',
  'INSERT',
  'INT',
  'INT1',
  'INT2',
  'INT3',
  'INT4',
  'INT8',
  'INTEGER',
  'INTERVAL',
  'INTO',
  'IS',
  'ITERATE',
  'JOIN',
  'KEY',
  'KEYS',
  'KILL',
  'LEADING',
  'LEAVE',
  'LEFT',
  'LIKE',
  'LIMIT',
  'LINES',
  'LOAD',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCK',
  'LONG',
  'LONGBLOB',
  'LONGTEXT',
  'LOOP',
  'LOW_PRIORITY',
  'MATCH',
  'MEDIUMBLOB',
  'MEDIUMINT',
  'MEDIUMTEXT',
  'MIDDLEINT',
  'MINUTE_MICROSECOND',
  'MINUTE_SECOND',
  'MOD',
  'MODIFIES',
  'NATURAL',
  'NOT',
  'NO_WRITE_TO_BINLOG',
  'NULL',
  'NUMERIC',
  'ON',
  'OPTIMIZE',
  'OPTION',
  'OPTIONALLY',
  'OR',
  'ORDER',
  'OUT',
  'OUTER',
  'OUTFILE',
  'PRECISION',
  'PRIMARY',
  'PROCEDURE',
  'PURGE',
  'READ',
  'READS',
  'REAL',
  'REFERENCES',
  'REGEXP',
  'RELEASE',
  'RENAME',
  'REPEAT',
  'REPLACE',
  'REQUIRE',
  'RESTRICT',
  'RETURN',
  'REVOKE',
  'RIGHT',
  'RLIKE',
  'SCHEMA',
  'SCHEMAS',
  'SECOND_MICROSECOND',
  'SELECT',
  'SENSITIVE',
  'SEPARATOR',
  'SET',
  'SHOW',
  'SMALLINT',
  'SONAME',
  'SPATIAL',
  'SPECIFIC',
  'SQL',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'SQL_BIG_RESULT',
  'SQL_CALC_FOUND_ROWS',
  'SQL_SMALL_RESULT',
  'SSL',
  'STARTING',
  'STRAIGHT_JOIN',
  'TABLE',
  'TERMINATED',
  'THEN',
  'TINYBLOB',
  'TINYINT',
  'TINYTEXT',
  'TO',
  'TRAILING',
  'TRIGGER',
  'TRUE',
  'UNDO',
  'UNION',
  'UNIQUE',
  'UNLOCK',
  'UNSIGNED',
  'UPDATE',
  'USAGE',
  'USE',
  'USING',
  'UTC_DATE',
  'UTC_TIME',
  'UTC_TIMESTAMP',
  'VALUES',
  'VARBINARY',
  'VARCHAR',
  'VARCHARACTER',
  'VARYING',
  'WHEN',
  'WHERE',
  'WHILE',
  'WITH',
  'WRITE',
  'XOR',
  'YEAR_MONTH',
  'ZEROFILL',
  'ASENSITIVE',
  'CALL',
  'CONDITION',
  'CONNECTION',
  'CONTINUE',
  'CURSOR',
  'DECLARE',
  'DETERMINISTIC',
  'EACH',
  'ELSEIF',
  'EXIT',
  'FETCH',
  'GOTO',
  'INOUT',
  'INSENSITIVE',
  'ITERATE',
  'LABEL',
  'LEAVE',
  'LOOP',
  'MODIFIES',
  'OUT',
  'READS',
  'RELEASE',
  'REPEAT',
  'RETURN',
  'SCHEMA',
  'SCHEMAS',
  'SENSITIVE',
  'SPECIFIC',
  'SQL',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'TRIGGER',
  'UNDO',
  'UPGRADE',
  'wHILE',
];

// Key:
//  %T%  tables
//  %C%  columns
//  %G%  group by
//  %W%  where conditions
//  %I%  id(s)
//  %V%  values
//  %E%  expressions
//  %L%  limit
var templates = {
  select: 'SELECT %DISTINCT% %C% FROM %T% WHERE %W% GROUP BY %G% ORDER BY %O% LIMIT %L%;',
  update: 'UPDATE %T% SET %E% WHERE %key%;',
  delete: 'DELETE FROM %T% WHERE %key%;',
  insert: 'INSERT INTO %T% %V% VALUES %E%;',
  insert_ref : 'INSERT INTO %T% %V% SELECT %E% FROM %T% WHERE project_id = %project_id%;'
};

exports.delete = function (table, column, id) {
  'use strict';
  var _id, sql, template = templates.delete;

  // split the ids, escape, and rejoin in pretty fmt
  // Must use string in case id is an integer
  _id = String(id)
          .split(',')
          .map(sanitize)
          .join(', ');

  // SQL closure
  _id = '(' + _id + ')';

  // format the query
  sql = template.replace('%T%', table)
                .replace('%key%', [column, 'IN', _id].join(' '));
  return sql;
};

exports.update = function (table, data, id) {
  'use strict';
  var key, value, isReserved, sql,
      expressions = [],
      template = templates.update;

  // For each property, escape both the key and value and push it into
  // the sql values array
  for (key in data) {
    if (key !== id) {
      value = data[key];

      // FIXME : This function allows values to be null.
      // Is that really what we want?

      isReserved = reservedWords.indexOf(key.toUpperCase()) > -1;
      key = isReserved ? '`' + key + '`' : key;

      if (value === null) {
        expressions.push([key, '=', 'NULL'].join(''));
      } else {
        expressions.push([key, '=', sanitize(value)].join(''));
      }
    }
  }

  sql = template.replace('%T%', table)
              .replace('%E%', expressions.join(', '))
              .replace('%key%', [id, '=', sanitize(data[id])].join(''));

  return sql;
};

// FIXME
//    This function is confusing because data can either by an array
//    of objects or a single object.  We can correct this with proper API
//    design.
exports.insert = function (table, data) {
  'use strict';
  var sql, key, max, idx, values = [],
      columns,
      expressions = [],
      template = templates.insert;

  // find the maximum number of keys for a row object
  max = 0;
  data.forEach(function (row, index) {
    var l = Object.keys(row).length;
    if (l > max) {
      max = l;
      idx = index;
    }
  });

  // calculate values
  for (key in data[idx]) {
    values.push(key);
  }

  var hasReference = values.indexOf('reference') > -1;
  var project_id;

  if (hasReference) {
    template = templates.insert_ref;
  }

  data.forEach(function (row) {
    var line = [];
    for (var key in values) {
      // default to null
      if (values[key] !== 'reference') {
        line.push(row[values[key]] !== null ? sanitize(row[values[key]]) : 'null');
      } else {
        line.push('IF(ISNULL(MAX(reference)), 1, MAX(reference) + 1)');
      }
      if (values[key] === 'project_id') { project_id = sanitize(row[values[key]]); }
    }
    var concat = hasReference ? line.join(', ') : '(' + line.join(', ') + ')';
    expressions.push(concat);
  });

  // escape columns that are mysql reserved words
  columns = values.map(function (column) {
    var isReserved = reservedWords.indexOf(column.toUpperCase()) > -1;
    return isReserved ? '`' + column +'`' : column;
  });

  // compile the template
  sql = template.replace(/%T%/g, table)
          .replace('%V%', '(' + columns.join(', ') + ')')
          .replace('%E%', expressions.join(', '))
          .replace('%project_id%', project_id);

  return sql;
};

exports.select = function (defn) {
  'use strict';
  var identifier, table, joinConditions, conditions,
    template = templates.select,
    tables = defn.tables,
    tableNames = Object.keys(defn.tables),
    columns = [],
    join = defn.join;

  // form the columns of the query by iterating through
  // the 'table' object and gluing the table to the column
  tables = defn.tables;
  columns = Object.keys(tables).map(function (table) {
    return mkColumns(table, tables[table].columns);
  });

  // form the join portion of the query
  if (!join) { joinConditions = tableNames.join(''); }
  else {
    joinConditions = tableNames.join(' JOIN ') + ' ON ';
    joinConditions += join.join(' AND ');
  }

  // default to 1
  conditions = (defn.where) ? parseWhereStatement(defn.where) : 1;

  var groups = defn.groupby ?
    defn.groupby.split('.').map(sanitize) :
    null;

  // TODO
  //    Order by should support ASC, DESC notation
  //    API? orderby : ['+date', '-project']
  var order = defn.orderby;

  return template.replace('%DISTINCT% ', defn.distinct ? 'DISTINCT ' : '')
    .replace('%C%', columns.join(', '))
    .replace('%T%', joinConditions)
    .replace('%W%', conditions)
    .replace(' GROUP BY %G%', groups ? ' GROUP BY ' + groups.join('.') : '')
    .replace(' ORDER BY %O%', order ? ' ORDER BY ' + order.join(', ') : '')
    .replace(' LIMIT %L%', defn.limit ? ' LIMIT ' + defn.limit : '');
};

function cdm(table, columns) {
  // creates a 'dot map' mapping on table
  // to multiple columns.
  // e.g. `table`.`column1`, `table`.`column2`
  return columns.map(function (c) {
    return [table, '.', sanitize(c)].join('');
  }).join(', ');
}

function parseWhereStatement(array) {
  // This is the full set of valid MySQL expressions
  // ref: http://dev.mysql.com/doc/refman/5.7/en/expressions.html
  var expressions;
  expressions = ['OR', '||', 'XOR', 'AND', '&&'];
  return array
    .map(function (expr) {
      return ~expressions.indexOf(expr) ? expr : escapeWhereCondition(expr);
    })
  .join(' ');
}

function getOperator(condition) {
  // These are all the valid MySQL comparisons.
  // ref: http://dev.mysql.com/doc/refman/5.7/en/expressions.html
  //
  // NOTE : Order of comparisons is important! These expressions
  // are ordered so that we find '>=' before '=', since both can
  // technically exist in an expression.
  var expression,
      comparisons = ['>=', '<=', '!=', '<>', '=', '<', '>', 'LIKE', 'IN'];

  expression = comparisons.filter(function (operator) {
    return condition.match(operator);
  });

  return expression.shift();
}

function escapeWhereCondition(condition) {
  // summary:
  //    Parses and escapes all components of a where
  //    clause separated by an equals sign.
  // eg:
  //  expr = 'a.id=b.id';
  //  parsewhr(expr)
  //    => '`a`.`id`=`b`.`id`'
  var collection, operator;

  // We allow nested where conditions, in the form of nested
  // arrays.  If 'conditon' is an array, we recursively call the
  // parseWhere function on it!
  if (util.isArray(condition)) { return '(' + parseWhereStatement(condition) + ')';  }

  operator = getOperator(condition);

  // the first part of a where condition is a column definition
  // and will not be escaped.  We assume it is correct.  The second
  // portion is the condition, which may contain user-defined
  // variables, and we should escape it.
  collection = condition.split(operator);

  // Clean up whitespace for LIKE operator
  if (operator === 'LIKE' || operator === 'IN') {
      collection[1] = collection[1].trim();
  }

  if (operator === 'IN') {
    // A space after IN
    collection[1] = ' ' + collection[1].trim();
  }
  else {
    // Escape the second part of the conditon
    collection[1] = sanitize(collection[1]);
  }

  // Fix up terms for LIKE operator
  if (operator === 'LIKE') {
      var patstr = collection[1].trim().toLowerCase();
      // Insert % SQL wildcard at both ends to generalize the search
      patstr = patstr.replace(/^'/, '\'%');
      patstr = patstr.replace(/'$/, '%\'');
      collection[1] = ' ' + patstr;
  }

  return collection.join(operator);
}

// Makes the columns of a table object.
// We don't actually have to escape the tables,
// it is up to the website designer to compose
// the proper query.
function mkColumns(table /* String */, columns /* Array */) {
  return columns.map(function (col) {
    if (col.indexOf('::') < 0) {
      return table + '.' + col;
    }
    else {
      // Handle aliasing
      var cparts = col.split('::');
      return table + '.' + cparts[0] + ' as ' + cparts[1];
    }
  })
  .join(', ');
}
