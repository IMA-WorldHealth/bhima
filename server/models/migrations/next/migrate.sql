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
