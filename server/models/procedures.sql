/*
  This file contains all the stored procedures used in bhima's database.  It
  should be loaded after functions.sql.
*/

DELIMITER $$

/*
  Invoicing procedures include: StageInvoice, StageInvoiceItem,
  StageBillingService, VerifySubsidyStageTable, PostInvoice, PostingSetupUtil,
  PostingJournalErrorHandler, CopyInvoiceToPostingJournal and PostToGeneralLedger
*/
SOURCE procedures/invoicing.sql

/*
  Cash procedures include: HandleCashRounding, PostCash, StageCash,
  StageCashItem, VerifyCashTemporaryTables, CalculateCashInvoiceBalances,
  WriteCashItems and WriteCash
*/
SOURCE procedures/cash.sql

/*
  Time period procedures include: CreateFiscalYear, GetPeriodRange and
  CreatePeriods
*/
SOURCE procedures/time_period.sql

/*
  Voucher procedures include: PostVoucher and ReverseTransaction
*/
SOURCE procedures/voucher.sql

/*
  Location procedures include: MergeLocations
*/
SOURCE procedures/location.sql

/*
  Trial balance procedures include: StageTrialBalanceTransaction and
  TrialBalance
*/
SOURCE procedures/trial_balance.sql

/*
  Stock procedures include: ComputeStockConsumptionByPeriod,
  ComputeStockConsumptionByDate and ComputeMovementReference
*/
SOURCE procedures/stock.sql

/*
  Posting procedures include: PostPurchase and PostIntegration
*/
SOURCE procedures/posting.sql
