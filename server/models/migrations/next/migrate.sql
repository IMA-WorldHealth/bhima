/* Release 1.30.2 */
/*
 * @author: ebed-meleck
 * @description: Updates for inventory, Add the project_id in lot table
 * @date: 2024-01-08
 */

-- update the inventory table
CALL add_column_if_missing('inventory', 'updated_by', 'SMALLINT(5) UNSIGNED DEFAULT NULL');

-- add the project_id in the lot
CALL add_column_if_missing('lot', 'project_id', 'SMALLINT(5) UNSIGNED DEFAULT 0');