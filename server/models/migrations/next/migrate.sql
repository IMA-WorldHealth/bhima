/* Release 1.30.2 */
CALL add_column_if_missing('stock_movement', 'project_id', 'SMALLINT(5) UNSIGNED NOT NULL');
