/*
  This file contains all the stored procedures used in bhima's database.  It
  should be loaded after functions.sql.
*/

SET names 'utf8mb4';
SET character_set_database = 'utf8mb4';
SET collation_database = 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4, CHARACTER_SET_CONNECTION = utf8mb4;

DELIMITER $$

/*
  Invoicing procedures include: StageInvoice, StageInvoiceItem,
  StageInvoiceFee, VerifySubsidyStageTable, PostInvoice, PostingSetupUtil,
  PostingJournalErrorHandler, CopyInvoiceToPostingJournal and PostToGeneralLedger
*/
SOURCE server/models/procedures/invoicing.sql

/*
  Cash procedures include: HandleCashRounding, PostCash, StageCash,
  StageCashItem, VerifyCashTemporaryTables, CalculateCashInvoiceBalances,
  WriteCashItems and WriteCash
*/
SOURCE server/models/procedures/cash.sql

/*
  Time period procedures include: CreateFiscalYear, GetPeriodRange and
  CreatePeriods
*/
SOURCE server/models/procedures/time_period.sql

/*
  Voucher procedures include: PostVoucher and ReverseTransaction
*/
SOURCE server/models/procedures/voucher.sql

/*
  Location procedures include: MergeLocations
*/
SOURCE server/models/procedures/location.sql

/*
  Trial balance procedures include: StageTrialBalanceTransaction and
  TrialBalance
*/
SOURCE server/models/procedures/trial_balance.sql

/*
  Stock procedures include: ComputeStockConsumptionByPeriod,
  ComputeStockConsumptionByDate and ComputeMovementReference
*/
SOURCE server/models/procedures/stock.sql

/*
  Inventory procedures include: ImportInventory
*/
SOURCE server/models/procedures/inventory.sql

/*
  account procedures
*/
SOURCE server/models/procedures/account.sql

/*
  role management procedures
*/
SOURCE server/models/procedures/roles.sql

DELIMITER ;
