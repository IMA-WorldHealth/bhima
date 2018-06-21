/*
  UPDATE ENTERPRISE_SETTING TABLE
  ===============================

  ADD PREPAYMENT INSIDE INVOICE OPTION
  If yes, the prepayment will be displayed on the invoice as proof that
  there was a prepayment
*/

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_prepayment_inside_invoice` TINYINT(1) NOT NULL DEFAULT 0;

