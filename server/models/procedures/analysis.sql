-- You want to "pivot" the data so that a linear list of values with 2 keys becomes a spreadsheet-like array.

-- Use this Procedure below posted at http://mysql.rjweb.org/doc.php/pivot.
DELIMITER $$

DROP PROCEDURE IF EXISTS Pivot$$

CREATE PROCEDURE Pivot(
  IN tbl_name TEXT,    -- table name (or db.tbl)
  IN base_cols TEXT,   -- column(s) on the left, separated by commas
  IN pivot_col TEXT,   -- name of column to put across the top
  IN tally_col TEXT,   -- name of column to SUM up
  IN where_clause TEXT,  -- empty string or "WHERE ..."
  IN order_by TEXT -- empty string or "ORDER BY ..."; usually the base_cols
)
DETERMINISTIC
SQL SECURITY INVOKER
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
      SET @full_error = CONCAT("ERROR ", @errno, " (", @sqlstate, "): ", @text);
      SELECT @full_error;
    END;

  -- Find the distinct values
  -- Build the SUM()s
  SET @subq = CONCAT('SELECT DISTINCT ', pivot_col, ' AS val ',
          ' FROM ', tbl_name, ' ', where_clause, ' ORDER BY 1') COLLATE utf8mb4_unicode_ci;
  -- select @subq;

  SET @cc1 = "CONCAT('SUM(IF(&p = ', &v, ', &t, 0)) AS ', &v)" COLLATE utf8mb4_unicode_ci;

  SET @cc2 = REPLACE(@cc1, '&p' , pivot_col) COLLATE utf8mb4_unicode_ci;

  SET @cc3 = REPLACE(@cc2, '&t', tally_col) COLLATE utf8mb4_unicode_ci;
  -- select @cc2, @cc3;
  SET @qval = CONCAT("'\"', val, '\"'") COLLATE utf8mb4_unicode_ci;
  -- select @qval;
  SET @cc4 = REPLACE(@cc3, '&v', @qval) COLLATE utf8mb4_unicode_ci;
  -- select @cc4;

  SET SESSION group_concat_max_len = 10000;  -- just in case
  SET @stmt = CONCAT(
      'SELECT GROUP_CONCAT(', @cc4, ' SEPARATOR ",\n") INTO @sums',
      ' FROM ( ', @subq, ' ) AS top') COLLATE utf8mb4_unicode_ci;

  -- SELECT @stmt;
  PREPARE _sql FROM @stmt;
  EXECUTE _sql;           -- Intermediate step: build SQL for columns
  DEALLOCATE PREPARE _sql;
  -- Construct the query and perform it
  SET @stmt2 = CONCAT(
      'SELECT ',
        base_cols, ',\n',
        @sums,
        ',\n SUM(', tally_col, ') AS Total'
      '\n FROM ', tbl_name, ' ',
      where_clause,
      ' GROUP BY ', base_cols,
      '\n WITH ROLLUP',
      '\n', order_by
    ) COLLATE utf8mb4_unicode_ci;

  -- SELECT @stmt2;          -- The statement that generates the result
  PREPARE _sql FROM @stmt2;
  EXECUTE _sql;           -- The resulting pivot table ouput
  DEALLOCATE PREPARE _sql;
END$$

DELIMITER ;
