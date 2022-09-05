/*
 * next version
 */

/**
 * @author: lomamech
 * @description: Added new information for asset management
 * @date: 2022-08-18
 */
CALL add_column_if_missing('inventory_group', 'depreciation_rate', 'FLOAT DEFAULT 0');
CALL add_column_if_missing('lot', 'acquisition_date', 'DATE DEFAULT NULL');