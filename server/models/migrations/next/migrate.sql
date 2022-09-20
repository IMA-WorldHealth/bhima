/*
 * next version
 */

/*
 * @author: lomamech
 * @date: 2022-09-07
 * @description: Problem with drug packaging
*/
CALL add_column_if_missing('stock_setting', 'enable_packaging_pharmaceutical_products', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_column_if_missing('inventory', 'is_count_per_container', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_column_if_missing('depot', 'is_count_per_container', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_column_if_missing('lot', 'package_size', 'INT(11) DEFAULT 1');
