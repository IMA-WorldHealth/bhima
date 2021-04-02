/**
  * @author: mbayopanda
  * @date: 2021-03-5
  * @desc: the stock_adjustment_log table
  */
DROP TABLE IF EXISTS `stock_adjustment_log`;
CREATE TABLE `stock_adjustment_log` (
  `movement_uuid` BINARY(16) NOT NULL,
  `created_at`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `old_quantity`  INT(11) NOT NULL DEFAULT 0,
  `new_quantity`  INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY `movement_uuid` (`movement_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


/**
@author: jniles
@date: 2021-03-18
@description: add edited flag to the purchase order.
*/
CALL add_column_if_missing('purchase', 'edited', 'BOOLEAN NOT NULL DEFAULT FALSE');
CALL add_column_if_missing('purchase', 'updated_at', 'TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP');

DROP TABLE IF EXISTS `integration`;

/**
  * @author: jmcameron
  * @date: 2021-03-25
  * @desc: Remove obsolete columns from the lots table
  */
CALL drop_column_if_exists('lots', 'delay');
CALL drop_column_if_exists('lots', 'initial_quantity');
CALL drop_column_if_exists('lots', 'quantity');
CALL drop_column_if_exists('lots', 'entry_date');

/**
* @author: jniles
* @date: 2021-04-02
* @desc: make the origin_uuid NULL by default.
*/
ALTER TABLE `lot` MODIFY `origin_uuid` BINARY(16) NULL;

