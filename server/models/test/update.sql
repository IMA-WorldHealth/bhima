-- Transfert Module
-- By: Bruce M.
-- Date: 2016-01-29

-- primary cash module
INSERT INTO `primary_cash_module` VALUES
  (1, "Transfert");

-- transaction type
INSERT INTO `transaction_type` VALUES
  (1, "pcash_transfert");

-- primary cash date to datetime
ALTER TABLE `primary_cash` CHANGE `date` `date` datetime;
