/* Release 1.30.2 */

/* NOTE: No changes from 1.30.0 to 1.30.2 */

/*
 * @author: ebed-meleck
 * @description: Updates for inventory
 * @date: 2024-01-08
 */

-- update the inventory table
CALL add_column_if_missing('inventory', 'updated_by', 'SMALLINT(5) UNSIGNED DEFAULT NULL');
