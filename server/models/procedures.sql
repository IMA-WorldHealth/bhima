/*
  This file contains all the stored procedures used in bhima's database.  It
  should be loaded after functions.sql.
*/

DELIMITER $$

SOURCE procedures/invoicing.sql

SOURCE procedures/cash.sql

SOURCE procedures/periods.sql

SOURCE procedures/voucher.sql

SOURCE procedures/location.sql

SOURCE procedures/trial_balance.sql

SOURCE procedures/stock.sql

SOURCE procedures/posting.sql
