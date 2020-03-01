SET names 'utf8mb4';
SET character_set_database = 'utf8mb4';
SET collation_database = 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4, CHARACTER_SET_CONNECTION = utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

DROP TRIGGER IF EXISTS cash_before_insert;
DROP TRIGGER IF EXISTS cash_document_map;
DROP TRIGGER IF EXISTS employee_before_insert;
DROP TRIGGER IF EXISTS employee_entity_map;
DROP TRIGGER IF EXISTS invoice_reference;
DROP TRIGGER IF EXISTS invoice_document_map;
DROP TRIGGER IF EXISTS patient_reference;
DROP TRIGGER IF EXISTS patient_entity_map;
DROP TRIGGER IF EXISTS purchase_reference;
DROP TRIGGER IF EXISTS purchase_document_map;
DROP TRIGGER IF EXISTS stock_movement_reference;
DROP TRIGGER IF EXISTS stock_movement_document_map;
DROP TRIGGER IF EXISTS stock_requisition_reference;
DROP TRIGGER IF EXISTS stock_requisition_document_map;
DROP TRIGGER IF EXISTS supplier_before_insert;
DROP TRIGGER IF EXISTS supplier_entity_map;
DROP TRIGGER IF EXISTS voucher_before_insert;
DROP TRIGGER IF EXISTS voucher_document_map;

DROP PROCEDURE IF EXISTS imck.addStagePaymentIndice;
DROP FUNCTION IF EXISTS imck.BUID;
DROP PROCEDURE IF EXISTS imck.CalculateCashInvoiceBalances;
DROP PROCEDURE IF EXISTS imck.CalculatePrepaymentBalances;
DROP PROCEDURE IF EXISTS imck.CloseFiscalYear;
DROP PROCEDURE IF EXISTS imck.ComputeStockConsumptionByDate;
DROP PROCEDURE IF EXISTS imck.ComputeStockConsumptionByPeriod;
DROP PROCEDURE IF EXISTS imck.CopyInvoiceToPostingJournal;
DROP PROCEDURE IF EXISTS imck.CreateFiscalYear;
DROP PROCEDURE IF EXISTS imck.CreatePeriods;
DROP FUNCTION IF EXISTS imck.GenerateTransactionId;
DROP FUNCTION IF EXISTS imck.GetExchangeRate;
DROP FUNCTION IF EXISTS imck.GetExchangeRateByProject;
DROP PROCEDURE IF EXISTS imck.GetPeriodRange;
DROP FUNCTION IF EXISTS imck.getStagePaymentIndice;
DROP FUNCTION IF EXISTS imck.GetTransactionNumberPart;
DROP FUNCTION IF EXISTS imck.HUID;
DROP PROCEDURE IF EXISTS imck.ImportAccount;
DROP PROCEDURE IF EXISTS imck.ImportInventory;
DROP PROCEDURE IF EXISTS imck.importPriceListItem;
DROP PROCEDURE IF EXISTS imck.ImportStock;
DROP PROCEDURE IF EXISTS imck.LinkPrepaymentsToInvoice;
DROP PROCEDURE IF EXISTS imck.MergeLocations;
DROP PROCEDURE IF EXISTS imck.Pivot;
DROP PROCEDURE IF EXISTS imck.PostCash;
DROP PROCEDURE IF EXISTS imck.PostingJournalErrorHandler;
DROP PROCEDURE IF EXISTS imck.PostingSetupUtil;
DROP PROCEDURE IF EXISTS imck.PostInvoice;
DROP PROCEDURE IF EXISTS imck.PostStockMovement;
DROP PROCEDURE IF EXISTS imck.PostToGeneralLedger;
DROP PROCEDURE IF EXISTS imck.PostVoucher;
DROP FUNCTION IF EXISTS imck.PredictAccountTypeId;
DROP PROCEDURE IF EXISTS imck.ReverseTransaction;
DROP PROCEDURE IF EXISTS imck.StageCash;
DROP PROCEDURE IF EXISTS imck.StageCashItem;
DROP PROCEDURE IF EXISTS imck.StageInvoice;
DROP PROCEDURE IF EXISTS imck.StageInvoiceItem;
DROP PROCEDURE IF EXISTS imck.StageInvoicingFee;
DROP PROCEDURE IF EXISTS imck.StageSubsidy;
DROP PROCEDURE IF EXISTS imck.StageTrialBalanceTransaction;
DROP PROCEDURE IF EXISTS imck.stockValue;
DROP FUNCTION IF EXISTS imck.sumTotalIndex;
DROP PROCEDURE IF EXISTS imck.superUserRole;
DROP PROCEDURE IF EXISTS imck.TrialBalanceErrors;
DROP PROCEDURE IF EXISTS imck.TrialBalanceSummary;
DROP PROCEDURE IF EXISTS imck.UnbalancedInvoicePayments;
DROP PROCEDURE IF EXISTS imck.UnbalancedInvoicePaymentsTable;
DROP PROCEDURE IF EXISTS imck.UndoEntityReversal;
DROP PROCEDURE IF EXISTS imck.updateIndices;
DROP PROCEDURE IF EXISTS imck.UpdatePeriodLabels;
DROP PROCEDURE IF EXISTS imck.UpdateStaffingIndices;
DROP PROCEDURE IF EXISTS imck.VerifyCashTemporaryTables;
DROP PROCEDURE IF EXISTS imck.VerifyInvoicingFeeStageTable;
DROP PROCEDURE IF EXISTS imck.VerifyPrepaymentTemporaryTables;
DROP PROCEDURE IF EXISTS imck.VerifySubsidyStageTable;
DROP PROCEDURE IF EXISTS imck.WriteCash;
DROP PROCEDURE IF EXISTS imck.WriteCashItems;
DROP PROCEDURE IF EXISTS imck.WriteInvoice;
DROP PROCEDURE IF EXISTS imck.zMergeAccounts;
DROP PROCEDURE IF EXISTS imck.zMergeServices;
DROP PROCEDURE IF EXISTS imck.zRecalculatePeriodTotals;
DROP PROCEDURE IF EXISTS imck.zRecomputeDocumentMap;
DROP PROCEDURE IF EXISTS imck.zRecomputeEntityMap;
DROP PROCEDURE IF EXISTS imck.zRepostCash;
DROP PROCEDURE IF EXISTS imck.zRepostInvoice;
DROP PROCEDURE IF EXISTS imck.zRepostVoucher;
DROP PROCEDURE IF EXISTS imck.zUpdatePatientText;

DELIMITER $$

-- Patient Triggers

CREATE TRIGGER patient_reference BEFORE INSERT ON patient
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(patient.reference) + 1, 1)) FROM patient WHERE patient.project_id = new.project_id);$$

CREATE TRIGGER patient_entity_map AFTER INSERT ON patient
FOR EACH ROW BEGIN

  -- this writes a patient entity into the entity_map table
  INSERT INTO entity_map
    SELECT new.uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;

  -- debtor entity reference removed to allow for reverse lookups - if debit
  -- entity is refined this can point directly to the debtor

  -- this writes a debtor entity into the entity_map table
  -- NOTE: the debtor actually points to the patient entity for convenience
  INSERT INTO entity_map
    SELECT new.debtor_uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$

-- Purchase Triggers

CREATE TRIGGER purchase_reference BEFORE INSERT ON purchase
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(purchase.reference) + 1, 1)) FROM purchase WHERE purchase.project_id = new.project_id);$$

CREATE TRIGGER purchase_document_map AFTER INSERT ON purchase
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'PO', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Invoice Triggers

CREATE TRIGGER invoice_reference BEFORE INSERT ON invoice
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(invoice.reference) + 1, 1)) FROM invoice WHERE invoice.project_id = new.project_id);$$

CREATE TRIGGER invoice_document_map AFTER INSERT ON invoice
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'IV', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Cash Payment Triggers

CREATE TRIGGER cash_before_insert BEFORE INSERT ON cash
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(cash.reference) + 1, 1)) FROM cash WHERE cash.project_id = new.project_id);$$

CREATE TRIGGER cash_document_map AFTER INSERT ON cash
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'CP', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$

-- Voucher Triggers

CREATE TRIGGER voucher_before_insert BEFORE INSERT ON voucher
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(voucher.reference) + 1, 1)) FROM voucher WHERE voucher.project_id = new.project_id);$$

CREATE TRIGGER voucher_document_map AFTER INSERT ON voucher
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'VO', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Employee Triggers

CREATE TRIGGER employee_before_insert BEFORE INSERT ON employee
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(employee.reference) + 1, 1)) FROM employee);$$

-- Must be fixed if the system is to manage multiple Enterprises at the same time, which would add the Enterprise identifier to each employee : @lomamech
CREATE TRIGGER employee_entity_map AFTER INSERT ON employee
FOR EACH ROW BEGIN
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'EM', enterprise.abbr, new.reference) FROM enterprise ON DUPLICATE KEY UPDATE text=text;
END$$

-- Supplier Triggers

CREATE TRIGGER supplier_before_insert BEFORE INSERT ON supplier
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(supplier.reference) + 1, 1)) FROM supplier);$$

CREATE TRIGGER supplier_entity_map AFTER INSERT ON supplier
FOR EACH ROW BEGIN

  -- this writes the supplier's creditor into the entity_map, pointing to the supplier
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'FO', new.reference) ON DUPLICATE KEY UPDATE text=text;
END$$

-- Stock Movement Triggers

-- the stock_movement reference is incremented based on the document_uuid.
CREATE TRIGGER stock_movement_reference BEFORE INSERT ON stock_movement
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(sm.reference) + 1, 1)) FROM stock_movement sm WHERE sm.document_uuid <> NEW.document_uuid);$$

-- compute the document map by simply concatenating the flux_id and the reference
CREATE TRIGGER stock_movement_document_map AFTER INSERT ON stock_movement
FOR EACH ROW BEGIN
  INSERT INTO `document_map` (uuid, text) VALUES (NEW.document_uuid, CONCAT_WS('.', 'SM', NEW.flux_id, NEW.reference))
  ON DUPLICATE KEY UPDATE uuid = NEW.document_uuid;
END$$

-- Stock Requisition Triggers
CREATE TRIGGER stock_requisition_reference BEFORE INSERT ON stock_requisition
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(stock_requisition.reference) + 1, 1)) FROM stock_requisition);$$

CREATE TRIGGER stock_requisition_document_map AFTER INSERT ON stock_requisition
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'SREQ', new.reference) ON DUPLICATE KEY UPDATE text=text;
END$$

DELIMITER ;
/*
  This file contains all the stored functions used in bhima's database and queries.
  It should be loaded after schema.sql.
*/

DELIMITER $$

/*
  HUID(hexUuid)

  Converts a hex uuid (36 chars) into a binary uuid (16 bytes)
*/
CREATE FUNCTION HUID(_uuid CHAR(36))
RETURNS BINARY(16) DETERMINISTIC
  RETURN UNHEX(REPLACE(_uuid, '-', ''));
$$


/*
  BUID(binaryUuid)

  Converts a binary uuid (16 bytes) to dash-delimited hex UUID (36 characters).
*/
CREATE FUNCTION BUID(b BINARY(16))
RETURNS CHAR(32) DETERMINISTIC
BEGIN
  RETURN HEX(b);
END
$$


/*
  GetExchangeRate(enterpriseId, currencyId, date)

  Returns the current exchange rate (`rate` column) for the given currency from
  the database.  It is up to the callee to determine how to treat the rate.

  @TODO Is there some way to make this do the IF() select as well?

  EXAMPLE

  SET currentExchangeRate = GetExchangeRate(enterpriseId, currencyId, date);
  SET currentExchangeRate = (SELECT IF(recordCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));
*/
CREATE FUNCTION GetExchangeRate(
  enterpriseId INT,
  currencyId INT,
  date TIMESTAMP
)

RETURNS DECIMAL(19, 8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT e.rate FROM exchange_rate AS e
    WHERE e.enterprise_id = enterpriseId AND e.currency_id = currencyId AND e.date <= date
    ORDER BY e.date DESC LIMIT 1
  );
END $$

/*
Sometime we need to get the exchange rate by the project id
*/
CREATE FUNCTION GetExchangeRateByProject(
  projectId INT,
  currencyId INT,
  date TIMESTAMP
)
RETURNS DECIMAL(19, 8) DETERMINISTIC
BEGIN
  RETURN (SELECT GetExchangeRate(p.enterprise_id, currencyId, date) FROM project p WHERE p.id = projectId);
END $$



/*
  GenerateTransactionId(projectId)

  Returns a new transaction id to be stored in the database by scanning for used
  ids in the posting_journal and general_ledger tables.

  Optimisation note: on the second iteration of this function a SUBSELECT to fetch
  the project string is used in favour of a table JOIN. This is because the previous function made a call
  to `MAX` which aggregates results and actually returns the project string even
  if there are no records in either journal table. Without this aggregate call
  nothing is returned and a NULL id will be returned if there are no records.

  EXAMPLE

  SET transId = SELECT GenerateTransactionid(projectid);
*/
CREATE FUNCTION GenerateTransactionId(
  target_project_id SMALLINT(5)
)
RETURNS VARCHAR(100) DETERMINISTIC
BEGIN
  RETURN (
    SELECT CONCAT(
      (SELECT abbr AS project_string FROM project WHERE id = target_project_id),
      IFNULL(MAX(current_max) + 1, 1)
    ) AS id
    FROM (
      (
        SELECT trans_id_reference_number AS current_max
        FROM general_ledger
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
      UNION
      (
        SELECT trans_id_reference_number AS current_max FROM posting_journal
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
    )A
  );
END $$

/**
 GetTransactionNumberPart(transId, projectId)

 Returns the number part of a transaction ID.
*/
CREATE FUNCTION GetTransactionNumberPart(
  trans_id TEXT,
  project_id SMALLINT(5)
)
RETURNS INT DETERMINISTIC
BEGIN
  RETURN (
    SELECT SUBSTRING(trans_id, LENGTH(project.abbr) + 1)
    FROM project
    WHERE id = project_id
  );
END $$

/*
  PredictAccountTypeId(accountNumber)

  Returns the account type id of the given account number
*/
CREATE FUNCTION PredictAccountTypeId(accountNumber INT(11))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  DECLARE oneDigit CHAR(1);
  DECLARE twoDigit CHAR(2);
  DECLARE accountType VARCHAR(20);
  DECLARE accountTypeId MEDIUMINT(8);
  SET oneDigit = (SELECT LEFT(accountNumber, 1));
  SET twoDigit = (SELECT LEFT(accountNumber, 2));

  IF (oneDigit = '1') THEN
    SET accountType = 'equity';
  END IF;

  IF (oneDigit = '2' OR oneDigit = '3' OR oneDigit = '4' OR oneDigit = '5') THEN
    SET accountType = 'asset';
  END IF;

  IF (oneDigit = '6') THEN
    SET accountType = 'expense';
  END IF;

  IF (oneDigit = '7') THEN
    SET accountType = 'income';
  END IF;

  IF (twoDigit = '40') THEN
    SET accountType = 'liability';
  END IF;

  IF (twoDigit = '80' OR twoDigit = '82' OR twoDigit = '84' OR twoDigit = '86' OR twoDigit = '88') THEN
    SET accountType = 'income';
  END IF;

  IF (twoDigit = '81' OR twoDigit = '83' OR twoDigit = '85' OR twoDigit = '87' OR twoDigit = '89') THEN
    SET accountType = 'expense';
  END IF;

  SET accountTypeId = (SELECT id FROM account_type WHERE `type` = accountType LIMIT 1);

  RETURN accountTypeId;
END
$$

DELIMITER ;
/*
  ---------------------------------------------------
  Import Account Procedure
  ---------------------------------------------------

  This procedure import a new account into the system
*/
DELIMITER $$

DROP PROCEDURE IF EXISTS ImportAccount;
CREATE PROCEDURE ImportAccount (
  IN enterpriseId SMALLINT(5),
  IN accountNumber INT(11),
  IN accountLabel VARCHAR(200),
  IN accountType VARCHAR(100),
  IN accountParent INT(11),
  IN importingOption TINYINT(1)
)
BEGIN
  DECLARE existAccount TINYINT(1);
  DECLARE existAccountType TINYINT(1);
  DECLARE existAccountParent TINYINT(1);
  DECLARE accountLength TINYINT(1);

  DECLARE accountParentId INT(11) DEFAULT 0;
  DECLARE defaultAccountParentId INT(11) DEFAULT 0;
  DECLARE accountTypeId MEDIUMINT(8);
  DECLARE IMPORT_DEFAULT_OHADA_ACCOUNT_OPTION TINYINT(1) DEFAULT 1;

  SET existAccount = (SELECT IF((SELECT COUNT(`number`) AS total FROM `account` WHERE `number` = accountNumber) > 0, 1, 0));
  SET existAccountType = (SELECT IF((SELECT COUNT(*) AS total FROM `account_type` WHERE `type` = accountType) > 0, 1, 0));
  SET accountTypeId = (SELECT id FROM `account_type` WHERE `type` = accountType LIMIT 1);
  SET existAccountParent = (SELECT IF((SELECT COUNT(*) AS total FROM `account` WHERE `number` = accountParent) > 0, 1, 0));

  SET accountLength = (SELECT CHAR_LENGTH(accountNumber));

  /*
    Handle parent account for importing ohada list of accounts
    We assume that ohada main accounts are already loaded into the system
  */
  IF (existAccountParent = 1) THEN
    SET accountParentId = (SELECT id FROM `account` WHERE `number` = accountParent);
  END IF;


  /*
    Create account if it doesn't exist

    if the account already exist skip because we are in a loop and
    we have to continue importing other accounts
  */
  IF (existAccount = 0 AND existAccountType = 1) THEN
    INSERT INTO `account` (`type_id`, `enterprise_id`, `number`, `label`, `parent`) VALUES (accountTypeId, enterpriseId, accountNumber, accountLabel, accountParentId);

    /*
      Insert default accounts for a quick usage

      insert an child account if the option is default ohada and we have an account with four digit
    */
    IF (accountLength = 4 AND importingOption = IMPORT_DEFAULT_OHADA_ACCOUNT_OPTION) THEN
      -- parent id
      SET defaultAccountParentId = (SELECT LAST_INSERT_ID());

      -- account type
      SET accountTypeId = PredictAccountTypeId(accountNumber);
      INSERT INTO `account` (`type_id`, `enterprise_id`, `number`, `label`, `parent`) VALUES (accountTypeId, enterpriseId, accountNumber * 10000, CONCAT('Compte ', accountLabel), defaultAccountParentId);
    END IF;

  END IF;
END $$

DELIMITER ;
-- You want to "pivot" the data so that a linear list of values with 2 keys becomes a spreadsheet-like array.

-- Use this Procedure below posted at http://mysql.rjweb.org/doc.php/pivot.
DELIMITER $$

DROP PROCEDURE IF EXISTS Pivot$$

CREATE PROCEDURE Pivot(
  IN tbl_name TEXT,    -- table name (or db.tbl)
  IN base_cols TEXT,   -- column(s) on the left, separated by commas
  IN pivot_col TEXT,   -- name of column to put across the top
  IN tally_col TEXT,   -- name of column to SUM up
  IN where_clause TEXT,  -- empty string or "WHERE ..."
  IN order_by TEXT -- empty string or "ORDER BY ..."; usually the base_cols
)
DETERMINISTIC
SQL SECURITY INVOKER
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
      SET @full_error = CONCAT("ERROR ", @errno, " (", @sqlstate, "): ", @text);
      SELECT @full_error;
    END;

  -- Find the distinct values
  -- Build the SUM()s
  SET @subq = CONCAT('SELECT DISTINCT ', pivot_col, ' AS val ',
          ' FROM ', tbl_name, ' ', where_clause, ' ORDER BY 1') COLLATE utf8mb4_unicode_ci;
  -- select @subq;

  SET @cc1 = "CONCAT('SUM(IF(&p = ', &v, ', &t, 0)) AS ', &v)" COLLATE utf8mb4_unicode_ci;

  SET @cc2 = REPLACE(@cc1, '&p' , pivot_col) COLLATE utf8mb4_unicode_ci;

  SET @cc3 = REPLACE(@cc2, '&t', tally_col) COLLATE utf8mb4_unicode_ci;
  -- select @cc2, @cc3;
  SET @qval = CONCAT("'\"', val, '\"'") COLLATE utf8mb4_unicode_ci;
  -- select @qval;
  SET @cc4 = REPLACE(@cc3, '&v', @qval) COLLATE utf8mb4_unicode_ci;
  -- select @cc4;

  SET SESSION group_concat_max_len = 10000;  -- just in case
  SET @stmt = CONCAT(
      'SELECT GROUP_CONCAT(', @cc4, ' SEPARATOR ",\n") INTO @sums',
      ' FROM ( ', @subq, ' ) AS top') COLLATE utf8mb4_unicode_ci;

  -- SELECT @stmt;
  PREPARE _sql FROM @stmt;
  EXECUTE _sql;           -- Intermediate step: build SQL for columns
  DEALLOCATE PREPARE _sql;
  -- Construct the query and perform it
  SET @stmt2 = CONCAT(
      'SELECT ',
        base_cols, ',\n',
        @sums,
        ',\n SUM(', tally_col, ') AS Total'
      '\n FROM ', tbl_name, ' ',
      where_clause,
      ' GROUP BY ', base_cols,
      '\n WITH ROLLUP',
      '\n', order_by
    ) COLLATE utf8mb4_unicode_ci;

  -- SELECT @stmt2;          -- The statement that generates the result
  PREPARE _sql FROM @stmt2;
  EXECUTE _sql;           -- The resulting pivot table ouput
  DEALLOCATE PREPARE _sql;
END$$

DELIMITER ;
DELIMITER $$
/*

--------
OVERVIEW
--------

This procedures file contains all the procedures related to paying cash
payments.  Please be sure to read the SCENARIOS section in detail to understand
the multiple scenarios that can occur and how the application handles them. They
should clarify the "why" questions while the code itself documents "how".

---------
SCENARIOS
---------

For all the following scenarios, please consider a world with two currencies A
and B.  The enterprise supports both currencies A and B. A's minimum monetary
unit is 50, and B's minimum monetary unit is .25.  The enterprise's base
currency is A.  Amounts expressed in "A" will be written 100.00A, and amounts
express in "B" will be written 100.00B.


PREPAYMENTS (SINGLE CURRENCY)
-----------------------------
The application allows for debtors to pre-pay into a cashbox, called a caution
payment.  Often, patients will need to provide some sort of guarantee or down
payment before an expensive operation will be performed.  In this case, the
money goes directly into the cashbox as a credit to the patient's account.

Consider the following scenario:

A debtor would like an expensive operation performed.  To prove the debtor has
the required capital, the enterprise requires a down payment of 500A.  The
debtor goes to the cash window to deposit their 500A.

The following two lines will be written in a transaction:
 1. A 500A debit against the cashbox (putting money into it).
 2. A 500A credit to the debtor (increasing their account w/ the enterprise)


PREPAYMENTS (MULTI-CURRENCY)
----------------------------
Consider the following scenario:

Suppose the exchange rate is 1000A to 1B.

The debtor would like an expensive operation performed.  The enterprise requires
that the debtor pay 10000A as a down payment.  The debtor chooses to pay in
currency B at the cash window.  They will pay (10000A * (1B / 1000A)) = 10B.

The debtor provides 10B as payment.  The application will record the following:
 1. A 10000A debit against the cashbox (representing 10B put into it)
 2. A 10000A credit for the debtor.

In the metadata of the transaction, it is recorded that the debtor actually paid
in B a value of 10B.  However, from the enterprise's perspective, they paid the
equivalent in currency A.

PAYING A SINGLE INVOICE
-----------------------
Consider the following scenario:

A debtor is invoiced for a product 750A, with an exchange rate of 1000A to 1B.
If they choose to pay the invoice that day in currency B, they will be required
to pay 0.75B.

They go to the window to pay in currency B.  They pay 0.75B.  The following
transaction is recorded:
 1. A 750A debit against the cashbox account
 2. A 750 credit against the debtor and their invoice.

As above, the fact they paid with currency B is recorded as metadata.


PAYING A SINGLE INVOICE (WITH LAG)
----------------------------------
Consider the following scenario:

A debtor is invoiced for a product 750A, with an exchange rate of 1000A to 1B.
If they choose to pay the invoice that day in currency B, they will be required
to pay .75B.

However, they instead return on a later date, when the exchange rate has jumped
to 1100A to 1B.  Now, if they choose to pay the invoice on that day, they will
be required to pay (750A * (1B / 1100A)) = 0.68B.  This is not a value they can
produce with a minimum monetary unit of 0.25B.

We can round down to 0.50B (a loss to the enterprise of 0.19B) or round up to
0.75B (a gain to the enterprise of 0.7B).  Since rounding up is the smallest
difference (put another way: the closest to the real price), the system will
round up.

The debtor pays into the system 0.75B, but their invoice was only for 0.68B.
The system will write a single transaction that balances the debtor's invoice
and puts the extra 0.7B in a gain account.  This gain account is defined in the
enterprise table's `gain_account_id`.  The resulting transaction will consist of
three lines:
 1. A debit of 0.75B against the cashbox account.
 2. A credit of 0.68B to the debtor for their invoice.
 3. A credit of 0.7B against the gain account.

NOTE: the values above are expressed in currency B for simplicity.  Since the
enterprise is run in currency A, all those values will be converted into
currency A with the exchange rate on the day it was paid.  In this case, 1100A
to 1B.


PAYING MULTIPLE INVOICES (WITH LAG)
-----------------------------------
The above scenario is a reasonable simple case:  The debtor is paying a single
invoice.  However, the scenario is made more complicated if they choose to pay
multiple invoices.

Suppose that our debtor is paying two invoices, for 750A and 450A.  The exchange
rate is still 1100A to 1B.  We calculate their total debt to be:
(750A + 450A) * (1B/1100A) = 1.09B

Each invoice would be:
750A * (1B/1100A) = 0.681B
450A * (1B/1100A) = 0.409B

Since we can only pay B in increments of 0.25, we can round down to 1B or up to
1.25B.  The application will choose 1B, as it is the closest to the sum of the
two invoices, resulting in a loss of 0.09B (99A) to the enterprise.

It is important to realize that, though the debtor is paying 0.09B less than the
total value of their invoice, they are paying their bill in full.  They should
not have a debt remaining with the enterprise after this transaction. Therefore,
our algorithm will need to produce 0.09B from somewhere to complete the value of
both invoices the debtor is paying.  We take the 0.09B from the enterprise's
loss account, found in the enterprise table, in the column loss_account_id.

The debtor pays 1B, even though the total of their invoices was 1.09B.  The
application will write a single transaction that consists of 4 lines:
 1. A debit of 1B against the cashbox account.
 2. A credit of 0.681B against the first invoice of the debtor
 3. A credit of 0.409B against the second invoice of the debtor
 4. A debit of 0.09B against the loss account.

At the end of this procedure, the debtor will have equalized all their debts,
and the loss account will have made up the difference to ensure that every
invoice was correctly balanced.
*/


/*
CALL PostCash()

DESCRIPTION
This procedure is called after values are already written to the cash table.  It
is responsible for checking if a cash payment is a prepayment (caution) and
writing the transaction lines.  It also contains the algorithm for cycling
through all the invoices, crediting each one the appropriate amount and writing
the remaining balance to the gain or loss account.
*/
CREATE PROCEDURE PostCash(
  IN cashUuid binary(16)
)
BEGIN
  -- required posting values
  DECLARE cashDate DATETIME;
  DECLARE cashEnterpriseId SMALLINT(5);
  DECLARE cashCurrencyId TINYINT(3) UNSIGNED;
  DECLARE cashAmount DECIMAL(19,4);
  DECLARE enterpriseCurrencyId INT;
  DECLARE isCaution BOOLEAN;

  -- variables to store core set-up results
  DECLARE cashProjectId SMALLINT(5);
  DECLARE currentFiscalYearId MEDIUMINT(8) UNSIGNED;
  DECLARE currentPeriodId MEDIUMINT(8) UNSIGNED;
  DECLARE currentExchangeRate DECIMAL(19, 8);
  DECLARE transactionId VARCHAR(100);

  -- variables to be set from the enterprise settings
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  DECLARE minMonentaryUnit DECIMAL(19,4);
  DECLARE previousInvoiceBalances DECIMAL(19,4);

  DECLARE remainder DECIMAL(19,4);
  DECLARE lastInvoiceUuid BINARY(16);

  DECLARE cashPaymentOriginId SMALLINT(5);
  DECLARE transIdNumberPart INT;

  -- set origin to the CASH_PAYMENT transaction type
  SET cashPaymentOriginId = 2;

  -- copy cash payment values into working variables
  SELECT cash.amount, cash.date, cash.currency_id, enterprise.id, cash.project_id, enterprise.currency_id, cash.is_caution
    INTO  cashAmount, cashDate, cashCurrencyId, cashEnterpriseId, cashProjectId, enterpriseCurrencyId, isCaution
  FROM cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  -- populate core setup values
  CALL PostingSetupUtil(cashDate, cashEnterpriseId, cashProjectId, cashCurrencyId, currentFiscalYearId, currentPeriodId, currentExchangeRate, enterpriseCurrencyId, transactionId, gain_account_id, loss_account_id);

  -- get the current exchange rate
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  SET transIdNumberPart = GetTransactionNumberPart(transactionId, cashProjectId);

  /*
    Begin the posting process.  We will first write the total value as moving into the cashbox
    (a debit to the cashbox's cash account).  Then, we will loop through each cash_item and credit
    the debtor for the amount they paid towards each invoice.

    NOTE
    In this section we divide by exchange rate (like x * (1/exchangeRate)) because we are converting
    from a non-native currency into the native enterprise currency.
  */

  -- write the cash amount going into the cashbox to the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, user_id, transaction_type_id
  ) SELECT
    HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid, c.description,
    cb.account_id, c.amount, 0, (c.amount * (1 / currentExchangeRate)), 0, c.currency_id, c.user_id, cashPaymentOriginId
  FROM cash AS c
    JOIN cash_box_account_currency AS cb ON cb.currency_id = c.currency_id AND cb.cash_box_id = c.cashbox_id
  WHERE c.uuid = cashUuid;

  /*
    If this is a caution payment, all we need to do is convert and write a single
    line to the posting_journal.
  */
  IF isCaution THEN

    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, transaction_type_id
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid,
      c.description, dg.account_id, 0, c.amount, 0, (c.amount * (1 / currentExchangeRate)), c.currency_id,
      c.debtor_uuid, c.user_id, cashPaymentOriginId
    FROM cash AS c
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

  /*
    In this block, we are paying cash items.  We have to look through each cash item, recording the
    amount paid as a new line in the posting_journal.  The `reference_uuid` is assigned to the
    `invoice_uuid` of the cash_item table.
  */
  ELSE

    -- make sure the temporary tables exist for invoice balances
    CALL VerifyCashTemporaryTables();

    -- write each cash_item into the posting_journal
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, reference_uuid, transaction_type_id
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid,
      c.description, dg.account_id, 0, ci.amount, 0, (ci.amount * (1 / currentExchangeRate)), c.currency_id,
      c.debtor_uuid, c.user_id, ci.invoice_uuid, cashPaymentOriginId
    FROM cash AS c
      JOIN cash_item AS ci ON c.uuid = ci.cash_uuid
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

    /*
      Finally, we have to see if there is any rounding to do.  If the absolute value of the balance
      due minus the balance paid is less than the minMonentaryUnit, it means we should just round that
      amount away.

      If (cashAmount - previousInvoiceBalances) > 0 then the debtor overpaid and we should debit them and
      credit the rounding account.  If the (cashAmount - previousInvoiceBalances) is negative, then the debtor
      underpaid and we should credit them and debit the rounding account the remainder
    */

    /* These values are in the original currency amount */
    SET previousInvoiceBalances = (
      SELECT SUM(invoice.balance) AS balance FROM stage_cash_invoice_balances AS invoice
    );

    -- this is date ASC to get the most recent invoice
    SET lastInvoiceUuid = (
      SELECT invoice.uuid FROM stage_cash_invoice_balances AS invoice ORDER BY invoice.date LIMIT 1
    );

    SET minMonentaryUnit = (
      SELECT currency.min_monentary_unit FROM currency WHERE currency.id = cashCurrencyId
    );

    SET remainder = cashAmount - previousInvoiceBalances;

    -- check if we should round or not
    -- if the remainder is 0 the invoice is payed without need for rounding
    IF (minMonentaryUnit > ABS(remainder) && remainder <> 0) THEN

      /*
        A positive remainder means that the debtor overpaid slightly and we should debit
        the difference to the debtor and credit the difference as a gain to the gain_account

        - The debtor entity an invoice reference are not included on the gain
          account transaction. In this case the debtor covered MORE than the
          invoiced amount and so referencing them on the enterprise gain will
          actually debit them the additional amount.
      */
      IF (remainder > 0) THEN

        -- The debtor is not debited in this transaction. They have already
        -- balanced the invoice and their debt according to the invoice (the
        -- exact amount). The additional payment can just be put in a gain account.

        -- credit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id, transaction_type_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid, c.description,
          gain_account_id, 0, remainder, 0, (remainder * (1 / currentExchangeRate)), c.currency_id, c.user_id, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

      /*
        A negative remainder means that the debtor underpaid slightly and we should credit
        the difference to the debtor and debit the difference as a loss to the loss_account

        - The debtor and invoice are referenced on the loss account transaction
          make up for the amount that is loss. In this case the debtor has not
          actually paid enough money to cover the amount of the invoice. If this
          is not referenced his balance will not be zero.
      */
      ELSE

        -- convert the remainder into the enterprise currency
        SET remainder = (-1 * remainder);

        -- credit the debtor
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, user_id, reference_uuid, transaction_type_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid, c.description,
          dg.account_id, 0, remainder, 0, (remainder * (1 / currentExchangeRate)), c.currency_id,
          c.debtor_uuid, c.user_id, lastInvoiceUuid, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

        -- debit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id, transaction_type_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, transIdNumberPart, c.date, c.uuid, c.description,
          loss_account_id, remainder, 0, (remainder * (1 / currentExchangeRate)), 0, c.currency_id, c.user_id, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;
      END IF;
    END IF;
  END IF;
END $$


/*
StageCash()

DESCRIPTION
This procedure exists solely to transfer data between JS and SQL. Since JS is
dynamically typed, but SQL is static, we have to define the order and types of
each variable below.  It is called at the beginning of the posting process.
*/
CREATE PROCEDURE StageCash(
  IN amount DECIMAL(19,4) UNSIGNED,
  IN currency_id TINYINT(3),
  IN cashbox_id MEDIUMINT(8) UNSIGNED,
  IN debtor_uuid BINARY(16),
  IN project_id SMALLINT(5) UNSIGNED,
  IN date TIMESTAMP,
  IN user_id SMALLINT(5) UNSIGNED,
  IN is_caution BOOLEAN,
  IN description TEXT,
  IN uuid BINARY(16)
)
BEGIN
  -- verify if cash stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_stage` = 1;
  SELECT NULL FROM stage_cash LIMIT 0;


  IF (`no_cash_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);

  ELSE
    INSERT INTO stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);
  END IF;
END $$


/*
StageCashItem()

DESCRIPTION
This procedure exists solely to transfer data between JS and SQL. Since JS is
dynamically typed, but SQL is static, we have to define the order and types of
each variable below.  Like StageCash() it is called for each cash_item at the
beginning of the posting process, after StageCash().
*/
CREATE PROCEDURE StageCashItem(
  IN uuid BINARY(16),
  IN cash_uuid BINARY(16),
  IN invoice_uuid BINARY(16)
)
BEGIN
  -- verify if cash_item stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_item_stage` = 1;
  SELECT NULL FROM `stage_cash_item` LIMIT 0;

  IF (`no_cash_item_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash_item
      (INDEX invoice_uuid (invoice_uuid))
      SELECT uuid, cash_uuid, invoice_uuid;

  ELSE
    INSERT INTO stage_cash_item (SELECT uuid, cash_uuid, invoice_uuid);
  END IF;
END $$


/*
VerifyCashTemporaryTables()

DESCRIPTION
This procedure creates the temporary tables for cash payments in case they do
not exist.  It is used internally to avoid errors about tables not existing or
strange JOINs against nonexistent tables.
*/
CREATE PROCEDURE VerifyCashTemporaryTables()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_records (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP,
    INDEX uuid (uuid),
    INDEX entity_uuid (entity_uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_references (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP,
    INDEX uuid (uuid),
    INDEX entity_uuid (entity_uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_invoice_balances (
    uuid BINARY(16), balance DECIMAL(19, 4), date TIMESTAMP,
    INDEX uuid (uuid)
  );
END $$

/*
CalculateCashInvoiceBalances()

DESCRIPTION
Gathers all invoices that the cash payment is attempting to pay and computes
their current balances.  This ensures that all the cash payments will be able
to correctly allocate the total payment to each invoice.
*/
CREATE PROCEDURE CalculateCashInvoiceBalances(
  IN cashUuid BINARY(16)
)
BEGIN
  DECLARE cashDate DATETIME;
  DECLARE cashCurrencyId INT;
  DECLARE cashEnterpriseId INT;
  DECLARE cashDebtorUuid BINARY(16);
  DECLARE enterpriseCurrencyId INT;
  DECLARE currentExchangeRate DECIMAL(19,4);

  -- copy cash payment values into working variables
  SELECT cash.date, cash.currency_id, enterprise.id, enterprise.currency_id, cash.debtor_uuid
    INTO cashDate, cashCurrencyId, cashEnterpriseId, enterpriseCurrencyId, cashDebtorUuid
  FROM stage_cash AS cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  /* calculate the exchange rate for balances based on the stored cash currency */
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  CALL VerifyCashTemporaryTables();

  INSERT INTO stage_cash_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.entity_uuid, p.trans_date as date
    FROM posting_journal AS p
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = p.record_uuid
    WHERE ci.cash_uuid = cashUuid
    AND p.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_records
    SELECT g.record_uuid AS uuid, g.debit_equiv as debit, g.credit_equiv as credit, g.entity_uuid, g.trans_date as date
    FROM general_ledger AS g
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = g.record_uuid
    WHERE ci.cash_uuid = cashUuid
    AND g.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.entity_uuid, p.trans_date as date
    FROM posting_journal AS p
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = p.reference_uuid
    WHERE ci.cash_uuid = cashUuid
    AND p.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_references
    SELECT g.reference_uuid AS uuid, g.debit_equiv as debit, g.credit_equiv as credit, g.entity_uuid, g.trans_date as date
    FROM general_ledger AS g
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = g.reference_uuid
    WHERE ci.cash_uuid = cashUuid
    AND g.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_invoice_balances
    SELECT zz.uuid, zz.balance, zz.date
    FROM (
      SELECT ledger.uuid, (SUM(ledger.debit - ledger.credit) * currentExchangeRate) AS balance, MIN(ledger.date) AS date
      FROM (
        SELECT crec.uuid, crec.debit, crec.credit, crec.entity_uuid, crec.date FROM stage_cash_records AS crec
      UNION ALL
        SELECT cref.uuid, cref.debit, cref.credit, cref.entity_uuid, cref.date FROM stage_cash_references AS cref
      ) AS ledger
      GROUP BY ledger.uuid
    ) AS zz ORDER BY zz.date;
END $$

/*
WriteCashItems()

DESCRIPTION
Loops through all the cash payments, writing them to disk in the cash_items
table.  In order to determine what value to assign each invoice, the
CalculateCashInvoiceBalances() procedures should be called before this method to
ensure that the current balances of previous invoices are known.  Only once the
up to date balances are known can allocation be performed and payments assigned
to each invoice.

NOTE
This procedure also blocks a debtor from overpaying an invoice.  An overpayment
is defined as having a value greater than the sum of all invoices they are
attempting to pay, plus the min currency monetary unit.  Put another way, the
difference between the payment amount and the total cost of all invoices should
not be greater than the min monetary unit.
*/
CREATE PROCEDURE WriteCashItems(
  IN cashUuid BINARY(16)
)
BEGIN

  DECLARE cashAmount DECIMAL(19, 4);
  DECLARE minMonentaryUnit DECIMAL(19,4);

  DECLARE totalInvoiceCost DECIMAL(19,4);
  DECLARE amountToAllocate DECIMAL(19,4);
  DECLARE allocationAmount DECIMAL(19,4);
  DECLARE invoiceUuid BINARY(16);
  DECLARE invoiceBalance DECIMAL(19,4);
  DECLARE done INT DEFAULT FALSE;

  -- error condition states
  DECLARE Overpaid CONDITION FOR SQLSTATE '45501';

  -- CURSOR for allocation of payments to invoice costs.
  DECLARE curse CURSOR FOR SELECT invoice.uuid, invoice.balance FROM stage_cash_invoice_balances AS invoice;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- set local variables
  SELECT cash.amount, currency.min_monentary_unit
    INTO cashAmount, minMonentaryUnit
  FROM cash JOIN currency ON currency.id = cash.currency_id
  WHERE cash.uuid = cashUuid;

  /*
    Calculate the balances on invoices to pay.
    NOTE: this assumes that CalculateCashInvoiceBalances(cashUuid) has been called before this procedure
  */
  SET totalInvoiceCost = (SELECT IFNULL(SUM(invoice.balance), 0) FROM stage_cash_invoice_balances AS invoice);

  /*
    If the difference between the paid amount and the totalInvoiceCost is greater than the
    minMonentaryUnit, the client has overpaid.
  */
  IF ((cashAmount - totalInvoiceCost)  > minMonentaryUnit) THEN
    SET @text = CONCAT(
      'The invoices appear to be overpaid.  The total cost of all invoices are ',
      CAST(totalInvoiceCost AS char), ' but the cash payment amount is ', CAST(cashAmount AS char)
    );

    SIGNAL Overpaid SET MESSAGE_TEXT = @text;
  END IF;

  /*
   NOTE
   It is possible to underpay.  This is never checked - the loop will
   simply exit early and the other invoices will not be credited.

   Loop through the table of invoice balances, allocating money from the total
    payment to balance those invoices.
  */
  SET amountToAllocate = cashAmount;

  OPEN curse;

  allocateCashPayments: LOOP
    FETCH curse INTO invoiceUuid, invoiceBalance;

    IF done THEN
      LEAVE allocateCashPayments;
    END IF;

    -- figure out how much to allocate
    IF (amountToAllocate - invoiceBalance > 0) THEN
      SET amountToAllocate = amountToAllocate - invoiceBalance;
      SET allocationAmount = invoiceBalance;
    ELSE
      SET allocationAmount = amountToAllocate;
      SET amountToAllocate = 0;
      SET done = TRUE;
    END IF;

    INSERT INTO cash_item
      SELECT stage_cash_item.uuid, stage_cash_item.cash_uuid, allocationAmount, invoiceUuid
      FROM stage_cash_item
      WHERE stage_cash_item.invoice_uuid = invoiceUuid AND stage_cash_item.cash_uuid = cashUuid LIMIT 1;

  END LOOP allocateCashPayments;
END $$


/*
WriteCash()

DESCRIPTION
This procedure simply copies the cash values out of the staging tables and
writes them to the cash table.
*/
CREATE PROCEDURE WriteCash(
  IN cashUuid BINARY(16)
)
BEGIN
  -- cash details
  INSERT INTO cash (uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution)
    SELECT * FROM stage_cash WHERE stage_cash.uuid = cashUuid;
END $$

DELIMITER ;
DELIMITER $$
/*
  ---------------------------------------------------
  Import Inventory Procedure
  ---------------------------------------------------

  This procedure import a new inventory into the system
  by creating one and performing a stock integration
  if necessary.
*/
DROP PROCEDURE IF EXISTS ImportInventory;
CREATE PROCEDURE ImportInventory (
  IN enterpriseId SMALLINT(5),
  IN inventoryGroupName VARCHAR(100),
  IN inventoryCode VARCHAR(30),
  IN inventoryText VARCHAR(100),
  IN inventoryType VARCHAR(30),
  IN inventoryUnit VARCHAR(30),
  IN inventoryUnitPrice DECIMAL(10, 4)
)
BEGIN
  DECLARE existInventoryGroup TINYINT(1);
  DECLARE existInventoryType TINYINT(1);
  DECLARE existInventoryUnit TINYINT(1);
  DECLARE existInventory TINYINT(1);

  DECLARE randomCode INT(11);
  DECLARE inventoryGroupUuid BINARY(16);
  DECLARE inventoryTypeId TINYINT(3);
  DECLARE inventoryUnitId SMALLINT(5);

  SET existInventoryGroup = (SELECT IF((SELECT COUNT(`name`) AS total FROM `inventory_group` WHERE `name` = inventoryGroupName) > 0, 1, 0));
  SET existInventory = (SELECT IF((SELECT COUNT(`text`) AS total FROM `inventory` WHERE `code` = inventoryCode OR `text` = inventoryText) > 0, 1, 0));
  SET existInventoryType = (SELECT IF((SELECT COUNT(*) AS total FROM `inventory_type` WHERE `text` = inventoryType) > 0, 1, 0));
  SET existInventoryUnit = (SELECT IF((SELECT COUNT(*) AS total FROM `inventory_unit` WHERE `text` = inventoryUnit) > 0, 1, 0));

  /* Create group if doesn't exist */
  IF (existInventoryGroup = 0) THEN
    SET randomCode = (SELECT ROUND(RAND() * 10000000));
    SET inventoryGroupUuid = HUID(UUID());
    INSERT INTO `inventory_group` (`uuid`, `name`, `code`) VALUES (inventoryGroupUuid, inventoryGroupName, randomCode);
  ELSE
    SET inventoryGroupUuid = (SELECT `uuid` FROM `inventory_group` WHERE `name` = inventoryGroupName LIMIT 1);
  END IF;

  /* Create type if doesn't exist */
  IF (existInventoryType = 0) THEN
    SET inventoryTypeId = (SELECT MAX(`id`) + 1 FROM `inventory_type`);
    INSERT INTO `inventory_type` (`id`, `text`) VALUES (inventoryTypeId, inventoryType);
  ELSE
    SET inventoryTypeId = (SELECT `id` FROM `inventory_type` WHERE LOWER(`text`) = LOWER(inventoryType) LIMIT 1);
  END IF;

  /* Create unit if doesn't exist */
  IF (existInventoryUnit = 0) THEN
    SET inventoryUnitId = (SELECT MAX(`id`) + 1 FROM `inventory_unit`);
    INSERT INTO `inventory_unit` (`id`, `abbr`, `text`) VALUES (inventoryUnitId, inventoryUnit, inventoryUnit);
  ELSE
    SET inventoryUnitId = (SELECT `id` FROM `inventory_unit` WHERE LOWER(`text`) = LOWER(inventoryUnit) LIMIT 1);
  END IF;

  /*
    Create inventory if it doesn't exist

    If the inventory already exists, skip because we are in a loop and
    we have to continue importing other inventories

    Inventory imported are considered by default as stockable (consumbale)
  */
  IF (existInventory = 0) THEN
    INSERT INTO `inventory` (`enterprise_id`, `uuid`, `code`, `text`, `price`, `group_uuid`, `type_id`, `unit_id`, `consumable`)
    VALUES
    (enterpriseId, HUID(UUID()), inventoryCode, inventoryText, inventoryUnitPrice, inventoryGroupUuid, inventoryTypeId, inventoryUnitId, 1);
  END IF;
END $$

DROP PROCEDURE IF EXISTS importPriceListItem;
CREATE PROCEDURE importPriceListItem (
  IN _price_list_uuid BINARY(16),
  IN _inventory_code VARCHAR(30),
  IN _value DOUBLE,
  IN _is_percentage tinyint(1)
)
BEGIN
  DECLARE _inventory_uuid BINARY(16);
  DECLARE isInventory tinyint(5);
   DECLARE inventoryLabel VARCHAR(100);

  SELECT uuid, text,  count(uuid)
  INTO _inventory_uuid, inventoryLabel, isInventory
  FROM inventory
  WHERE code = _inventory_code;

  IF isInventory = 1 THEN
    DELETE FROM price_list_item
      WHERE price_list_uuid = _price_list_uuid AND inventory_uuid = _inventory_uuid;
    INSERT INTO price_list_item(uuid, inventory_uuid, price_list_uuid, label, value, is_percentage)
    VALUES(HUID(uuid()), _inventory_uuid, _price_list_uuid, inventoryLabel, _value, _is_percentage);
  END IF;

END $$

DELIMITER ;
DELIMITER $$
/*
  This file contains code for creating and posting invoices made to patients.

  NOTE
  The rationale behind the Stage* procedures is to interface between JS and SQL.  Every stage method sets up a temporary table that can be used by other
  methods.  As temporary tables, they are scoped to the current connection,
  meaning that all other methods _must_ be called in the same database
  transaction.  Once the connection terminates, the tables are cleaned up.
*/


/*
  Prepare the record to be written to the `invoice` table.
*/
CREATE PROCEDURE StageInvoice(
  IN date DATETIME,
  IN cost DECIMAL(19, 4) UNSIGNED,
  IN description TEXT,
  IN service_id SMALLINT(5) UNSIGNED,
  IN debtor_uuid BINARY(16),
  IN project_id SMALLINT(5),
  IN user_id SMALLINT(5),
  IN uuid BINARY(16)
)
BEGIN
  -- verify if invoice stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create and select into it
  DECLARE `no_invoice_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_stage` = 1;
  SELECT NULL FROM `stage_invoice` LIMIT 0;

  IF (`no_invoice_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_invoice (
      SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date,
        description
    );
  ELSE
    INSERT INTO stage_invoice (
      SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date,
        description
    );
  END IF;
END $$

/*
  Prepare record(s) to be written to the `invoice_item` table.
*/
CREATE PROCEDURE StageInvoiceItem(
  IN uuid BINARY(16),
  IN inventory_uuid BINARY(16),
  IN quantity INT(10) UNSIGNED,
  IN transaction_price decimal(19, 4),
  IN inventory_price decimal(19, 4),
  IN debit decimal(19, 4),
  IN credit decimal(19, 4),
  IN invoice_uuid BINARY(16)
)
BEGIN
  -- verify if invoice item stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_invoice_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_item_stage` = 1;
  SELECT NULL FROM `stage_invoice_item` LIMIT 0;

  -- tables does not exist - create and enter data
  IF (`no_invoice_item_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_invoice_item (
      SELECT uuid, inventory_uuid, quantity, transaction_price, inventory_price,
        debit, credit, invoice_uuid
    );

  -- table exists - only enter data
  ELSE
    INSERT INTO stage_invoice_item (
      SELECT uuid, inventory_uuid, quantity, transaction_price, inventory_price,
        debit, credit, invoice_uuid
    );
  END IF;
END $$


CREATE PROCEDURE StageInvoicingFee(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifyInvoicingFeeStageTable();
  INSERT INTO stage_invoicing_fee (SELECT id, invoice_uuid);
END $$

CREATE PROCEDURE StageSubsidy(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifySubsidyStageTable();
  INSERT INTO stage_subsidy (SELECT id, invoice_uuid);
END $$

-- create a temporary staging table for the subsidies, this is done via a helper
-- method to ensure it has been created as sale writing time (subsidies are an
-- optional entity that may or may not have been called for staging)
CREATE PROCEDURE VerifySubsidyStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_subsidy (
    id INTEGER,
    invoice_uuid BINARY(16)
  );
END $$

CREATE PROCEDURE VerifyInvoicingFeeStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_invoicing_fee (
    id INTEGER,
    invoice_uuid BINARY(16)
  );
END $$

/*
  CALL WriteInvoice(uuid)

  DESCRIPTION
  This procedure takes all staged records and begins to compose the invoice from
  them.  Keep in mind:
    1) Invoicing Fees place percentage increase on the invoice in proportion
      to the base invoice cost.
    2) Subsidies place a percentage reduction on the invoice in proportion to
      the invoice cost.
    3) Invoicing Fees are applied first, then Subsidies are applied to the
      adjusted invoice amount.

  The final value of this algorithm is recorded in the invoices table as the
  cost of the invoice.  In the posting journal, the invoice...
*/

CREATE PROCEDURE WriteInvoice(
  IN uuid BINARY(16)
)
BEGIN
  -- running calculation variables
  DECLARE items_cost decimal(19, 4);
  DECLARE invoicing_fees_cost decimal(19, 4);
  DECLARE total_cost_to_debtor decimal(19, 4);
  DECLARE total_subsidy_cost decimal(19, 4);
  DECLARE total_subsidised_cost decimal(19, 4);

  -- ensure that all optional entities have staging tables available, it is
  -- possible that the invoice has not invoked methods to stage subsidies and
  -- invoicing fees if they are not relevant - this makes sure the tables
  -- exist for queries within this method.
  CALL VerifySubsidyStageTable();
  CALL VerifyInvoicingFeeStageTable();

  -- invoice details
  INSERT INTO invoice (
    project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description
  )
  SELECT * FROM stage_invoice WHERE stage_invoice.uuid = uuid;

  -- invoice item details
  INSERT INTO invoice_item (
    uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit,
    credit, invoice_uuid
  )

  SELECT * from stage_invoice_item WHERE stage_invoice_item.invoice_uuid = uuid;

  -- Total cost of all invoice items.  This is important to determine how much
  -- the invoicing fees
  SET items_cost = (
    SELECT SUM(credit) as cost FROM invoice_item where invoice_uuid = uuid
  );

  -- calculate invoicing fee based on total item cost
  INSERT INTO invoice_invoicing_fee (invoice_uuid, value, invoicing_fee_id)
  SELECT uuid, (invoicing_fee.value / 100) * items_cost, invoicing_fee.id
  FROM invoicing_fee WHERE id in (
    SELECT id FROM stage_invoicing_fee where invoice_uuid = uuid
  );

  -- total cost of all invoice items and invoicing fees
  SET invoicing_fees_cost = (
    SELECT IFNULL(SUM(value), 0) AS value
    FROM invoice_invoicing_fee
    WHERE invoice_uuid = uuid
  );

  -- cost so far to the debtor
  SET total_cost_to_debtor = items_cost + invoicing_fees_cost;

  -- calculate subsidy cost based on total cost to debtor
  INSERT INTO invoice_subsidy (invoice_uuid, value, subsidy_id)
  SELECT uuid, (subsidy.value / 100) * total_cost_to_debtor, subsidy.id
  FROM subsidy WHERE id in (
    SELECT id FROM stage_subsidy where invoice_uuid = uuid
  );

  -- calculate final value debtor must pay based on subsidised costs
  SET total_subsidy_cost = (
    SELECT IFNULL(SUM(value), 0) AS value
    FROM invoice_subsidy
    WHERE invoice_uuid = uuid
  );

  SET total_subsidised_cost = total_cost_to_debtor - total_subsidy_cost;

  -- update relevant fields to represent final costs
  UPDATE invoice SET cost = total_subsidised_cost WHERE invoice.uuid = uuid;

  -- return information relevant to the final calculated and written bill
  SELECT items_cost, invoicing_fees_cost, total_cost_to_debtor,
    total_subsidy_cost, total_subsidised_cost;
END $$


/*
  CALL PostInvoice(uuid);

  DESCRIPTION
  This procedure is called after an invoice is created and written into the
  `invoice` and `invoice_item` tables.  This procedure sets up the initial
  variable definitions before copying rows from the invoice tables into the
  posting journal.  It also performs basic checks for data integrity - that
  every account is properly defined.
*/
CREATE PROCEDURE PostInvoice(
  IN uuid binary(16)
)
BEGIN
  DECLARE InvalidSalesAccounts CONDITION FOR SQLSTATE '45006';

  -- required posting values
  DECLARE date DATETIME;
  DECLARE enterprise_id SMALLINT(5);
  DECLARE project_id SMALLINT(5);
  DECLARE currency_id TINYINT(3) UNSIGNED;

  -- variables to store core set-up results
  DECLARE current_fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  DECLARE verify_invalid_accounts SMALLINT(5);

  -- populate initial values specifically for this invoice
  SELECT invoice.date, enterprise.id, project.id, enterprise.currency_id
    INTO date, enterprise_id, project_id, currency_id
  FROM invoice JOIN project JOIN enterprise ON
    invoice.project_id = project.id AND
    project.enterprise_id = enterprise.id
  WHERE invoice.uuid = uuid;

  -- populate core set-up values
  CALL PostingSetupUtil(
    date, enterprise_id, project_id, currency_id, current_fiscal_year_id,
    current_period_id, current_exchange_rate, enterprise_currency_id,
    transaction_id, gain_account_id, loss_account_id
  );

  -- Check that all invoice items have sales accounts - if they do not the
  -- transaction will be unbalanced and the account_id will be NULL
  SELECT COUNT(invoice_item.uuid)
    INTO verify_invalid_accounts
  FROM invoice JOIN invoice_item JOIN inventory JOIN inventory_group
  ON invoice.uuid = invoice_item.invoice_uuid
    AND invoice_item.inventory_uuid = inventory.uuid
    AND inventory.group_uuid = inventory_group.uuid
  WHERE invoice.uuid = uuid
  AND inventory_group.sales_account IS NULL;

  IF verify_invalid_accounts > 0 THEN
    SIGNAL InvalidSalesAccounts
    SET MESSAGE_TEXT =
      'A NULL sales account has been found for an inventory item in this invoice.';
  END IF;

  -- now that we are sure that we have all error handled, lets go into the
  CALL CopyInvoiceToPostingJournal(
    uuid, transaction_id, project_id, current_fiscal_year_id, current_period_id,
    currency_id
  );

END $$


CREATE PROCEDURE PostingSetupUtil(
  IN date DATETIME,
  IN enterprise_id SMALLINT(5),
  IN project_id SMALLINT(5),
  IN currency_id TINYINT(3) UNSIGNED,
  OUT current_fiscal_year_id MEDIUMINT(8) UNSIGNED,
  OUT current_period_id MEDIUMINT(8) UNSIGNED,
  OUT current_exchange_rate DECIMAL(19, 4) UNSIGNED,
  OUT enterprise_currency_id TINYINT(3) UNSIGNED,
  OUT transaction_id VARCHAR(100),
  OUT gain_account INT UNSIGNED,
  OUT loss_account INT UNSIGNED
)
BEGIN
  SET current_fiscal_year_id = (
    SELECT id FROM fiscal_year AS fy
    WHERE date BETWEEN fy.start_date
      AND DATE(ADDDATE(fy.start_date, INTERVAL fy.number_of_months MONTH))
      AND fy.enterprise_id = enterprise_id
  );

  SET current_period_id = (
    SELECT id FROM period AS p
    WHERE DATE(date) BETWEEN DATE(p.start_date) AND DATE(p.end_date)
      AND p.fiscal_year_id = current_fiscal_year_id
  );

  SELECT e.gain_account_id, e.loss_account_id, e.currency_id
    INTO gain_account, loss_account, enterprise_currency_id
  FROM enterprise AS e WHERE e.id = enterprise_id;

  -- this uses the currency id passed in as a dependency
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (
    SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate)
  );

  -- get the transaction id from the GenerateTransactionId function
  SET transaction_id = GenerateTransactionId(project_id);

  -- error handling
  CALL PostingJournalErrorHandler(
    enterprise_id, project_id, current_fiscal_year_id,
    current_period_id, current_exchange_rate, date
  );
END $$

-- detects MySQL Posting Journal Errors
CREATE PROCEDURE PostingJournalErrorHandler(
  enterprise INT,
  project INT,
  fiscal INT,
  period INT,
  exchange DECIMAL,
  date DATETIME
)
BEGIN

  -- set up error declarations
  DECLARE NoEnterprise CONDITION FOR SQLSTATE '45001';
  DECLARE NoProject CONDITION FOR SQLSTATE '45002';
  DECLARE NoFiscalYear CONDITION FOR SQLSTATE '45003';
  DECLARE NoPeriod CONDITION FOR SQLSTATE '45004';
  DECLARE NoExchangeRate CONDITION FOR SQLSTATE '45005';

  IF enterprise IS NULL THEN
    SIGNAL NoEnterprise
      SET MESSAGE_TEXT = 'No enterprise found in the database.';
  END IF;

  IF project IS NULL THEN
    SIGNAL NoProject
      SET MESSAGE_TEXT = 'No project provided for that record.';
  END IF;

  IF fiscal IS NULL THEN
    SET @text = CONCAT('No fiscal year found for the provided date: ', CAST(date AS char));
    SIGNAL NoFiscalYear
      SET MESSAGE_TEXT = @text;
  END IF;

  IF period IS NULL THEN
    SET @text = CONCAT('No period found for the provided date: ', CAST(date AS char));
    SIGNAL NoPeriod
      SET MESSAGE_TEXT = @text;
  END IF;

  IF exchange IS NULL THEN
    SET @text = CONCAT('No exchange rate found for the provided date: ', CAST(date AS char));
    SIGNAL NoExchangeRate
      SET MESSAGE_TEXT = @text;
  END IF;
END
$$

-- Credit For Cautions
CREATE PROCEDURE CopyInvoiceToPostingJournal(
  iuuid BINARY(16),  -- the UUID of the patient invoice
  transId TEXT,
  projectId INT,
  fiscalYearId INT,
  periodId INT,
  currencyId INT
)
BEGIN
  -- local variables
  DECLARE done INT DEFAULT FALSE;

  -- invoice variables
  DECLARE idate DATETIME;
  DECLARE icost DECIMAL(19,4);
  DECLARE ientityId BINARY(16);
  DECLARE iuserId INT;
  DECLARE idescription TEXT;
  DECLARE iaccountId INT;

  DECLARE transIdNumberPart INT;

  -- caution variables
  DECLARE cid BINARY(16);
  DECLARE cbalance DECIMAL(19,4);
  DECLARE cdate DATETIME;
  DECLARE cdescription TEXT;

 -- cursor for debtor's cautions
 -- TODO(@jniles) - remove MAX() call.  This violates ONLY_FULL_GROUP_BY.
  DECLARE curse CURSOR FOR
    SELECT c.id, c.date, MAX(c.description), SUM(c.credit - c.debit) AS balance FROM (

        -- get the record_uuids in the posting journal
        SELECT debit_equiv as debit, credit_equiv as credit, posting_journal.trans_date as date, posting_journal.description, record_uuid AS id
        FROM posting_journal JOIN cash
          ON cash.uuid = posting_journal.record_uuid
        WHERE reference_uuid IS NULL AND entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the record_uuids in the general ledger
        SELECT debit_equiv as debit, credit_equiv as credit, general_ledger.trans_date as date, general_ledger.description, record_uuid AS id
        FROM general_ledger JOIN cash
          ON cash.uuid = general_ledger.record_uuid
        WHERE reference_uuid IS NULL AND entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the reference_uuids in the posting_journal
        SELECT debit_equiv as debit, credit_equiv as credit, posting_journal.trans_date as date, posting_journal.description, reference_uuid AS id
        FROM posting_journal JOIN cash
          ON cash.uuid = posting_journal.reference_uuid
        WHERE entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the reference_uuids in the general_ledger
        SELECT debit_equiv as debit, credit_equiv as credit, general_ledger.trans_date as date, general_ledger.description, reference_uuid AS id
        FROM general_ledger JOIN cash
          ON cash.uuid = general_ledger.reference_uuid
        WHERE entity_uuid = ientityId AND cash.is_caution = 0
    ) AS c
    GROUP BY c.id, c.date
    HAVING balance > 0
    ORDER BY c.date;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  SET transIdNumberPart = GetTransactionNumberPart(transId, projectId);

  -- set the invoice variables
  SELECT cost, debtor_uuid, date, user_id, description
    INTO icost, ientityId, idate, iuserId, idescription
  FROM invoice WHERE invoice.uuid = iuuid;

  -- set the transaction variables (account)
  SELECT account_id INTO iaccountId
  FROM debtor JOIN debtor_group
   ON debtor.group_uuid = debtor_group.uuid
  WHERE debtor.uuid = ientityId;

  -- open the cursor
  OPEN curse;

  -- create a prepared statement for efficiently writing to the posting_journal
  -- from within the caution LOOP

  -- loop through the cursor of caution payments and allocate payments against
  -- the current invoice to the caution by setting reference_uuid to the
  -- caution's record_uuid.
  cautionLoop: LOOP
    FETCH curse INTO cid, cdate, cdescription, cbalance;

    IF done THEN
      LEAVE cautionLoop;
    END IF;

    -- check: if the caution is more than the cost, assign the total cost of the
    -- invoice to the caution and exit the loop.
    IF cbalance >= icost THEN

      -- write the cost value from into the posting journal
      INSERT INTO posting_journal
          (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, transaction_type_id)
        VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate, iuuid, cdescription,
          iaccountId, icost, 0, icost, 0, currencyId, ientityId, cid, iuserId, 11
        );

      -- exit the loop
      SET done = TRUE;

    -- else: the caution is less than the cost, assign the total caution cost to
    -- the caution (making it 0), and continue
    ELSE

      -- if there is no more caution balance escape
      IF cbalance = 0 THEN
        SET done = TRUE;
      ELSE
        -- subtract the caution's balance from the cost
        SET icost = icost - cbalance;

        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, transaction_type_id
        ) VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate,
          iuuid, cdescription, iaccountId, cbalance, 0, cbalance, 0,
          currencyId, ientityId, cid, iuserId, 11
        );

      END IF;
    END IF;
  END LOOP;

  -- close the cursor
  CLOSE curse;

  -- if there is remainder cost, bill the debtor the full amount
  IF icost > 0 THEN
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, transaction_type_id
    ) VALUES (
      HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate,
      iuuid, idescription, iaccountId, icost, 0, icost, 0,
      currencyId, ientityId, iuserId, 11
    );
  END IF;

  -- copy the invoice_items into the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  )
   SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
    CONCAT(dm.text,': ', inv.text) as txt, ig.sales_account, ii.debit, ii.credit, ii.debit, ii.credit,
    currencyId, 11, i.user_id
  FROM invoice AS i JOIN invoice_item AS ii JOIN inventory as inv JOIN inventory_group AS ig JOIN document_map as dm ON
    i.uuid = ii.invoice_uuid AND
    ii.inventory_uuid = inv.uuid AND
    inv.group_uuid = ig.uuid AND
    dm.uuid = i.uuid
  WHERE i.uuid = iuuid;

  -- copy the invoice_subsidy records into the posting_journal (debits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
    i.description, su.account_id, isu.value, 0, isu.value, 0, currencyId, 11,
    i.user_id
  FROM invoice AS i JOIN invoice_subsidy AS isu JOIN subsidy AS su ON
    i.uuid = isu.invoice_uuid AND
    isu.subsidy_id = su.id
  WHERE i.uuid = iuuid;

  -- copy the invoice_invoicing_fee records into the posting_journal (credits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
    i.description, b.account_id, 0, ib.value, 0, ib.value, currencyId, 11,
    i.user_id
  FROM invoice AS i JOIN invoice_invoicing_fee AS ib JOIN invoicing_fee AS b ON
    i.uuid = ib.invoice_uuid AND
    ib.invoicing_fee_id = b.id
  WHERE i.uuid = iuuid;
END $$

/*
CALL LinkPrepaymentsToInvoice(invoiceUuid, debtorUuid);

This procedure establishes links between payments that have occurred before
goods or services have been billed.  At invoicing time, the system will check
if the debtor has a creditor balance.  If so, it will attempt to "link" the
prepayments by calling the LinkPrepaymentsToInvoice() method.

The following steps happen:
 1. All unbalanced cash payments before the invoice date are collected, along
with their balances.
 2. For each cash payment, a voucher line is added debiting the debtor and
crediting the invoice.  This line's value is MIN(invoice cost, cash value).
 3. The reference_uuid column is populated with the assigned cash payment's uuid.
 4. The invoice_cost is reduced by MIN(invoice cost, cash value).
 5. If invoice_cost is 0, break.  Otherwise, continue until out of cash payments.

This will either:
 1. Halt after the invoice has been completely allocated to a series of cash
payments.
OR
 2. Halt once all cash payments have been assigned to the invoice. There may or
may not be a remaining balance on the invoice.
*/
CREATE PROCEDURE LinkPrepaymentsToInvoice(
  IN invoice_uuid BINARY(16),
  IN debtor_uuid BINARY(16),
  IN description TEXT
)
BEGIN
  -- local variables
  DECLARE done INT DEFAULT FALSE;

  -- these are used in the loop
  DECLARE recordUuid BINARY(16);
  DECLARE recordBalance DECIMAL(19,4);
  DECLARE amountToAllocate DECIMAL(19,4);
  DECLARE allocationAmount DECIMAL(19,4);
  DECLARE totalAllocated DECIMAL(19,4);

  -- voucher properties
  DECLARE vUuid BINARY(16);
  DECLARE enterpriseCurrencyId SMALLINT(5);
  DECLARE linkTransactionTypeId SMALLINT(5);
  DECLARE debtorAccountId INT(10);

  DECLARE curse CURSOR FOR
    SELECT payment.uuid, payment.balance FROM stage_payment_balances AS payment;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- TODO(@jniles): propose issue for how to deal with this kind of transaction
  -- type that is automatically generated by the system.
  SET linkTransactionTypeId = 19;
  SET vUuid = HUID(UUID());

  SET enterpriseCurrencyId = (
    SELECT currency_id FROM enterprise
    JOIN project ON enterprise.id = project.enterprise_id
    JOIN invoice ON invoice.project_id = project.id
    WHERE invoice.uuid = invoice_uuid
    LIMIT 1
  );

  SET debtorAccountId = (
    SELECT account_id FROM debtor_group JOIN debtor
    ON debtor_group.uuid = debtor.group_uuid
    WHERE debtor.uuid = debtor_uuid
  );

  -- make the voucher that will link the debtor's invoices to their cautions.
  INSERT INTO voucher (uuid, date, project_id, currency_id, amount, description, user_id, type_id)
    SELECT vUuid, date, project_id, enterpriseCurrencyId, 0, description, user_id, linkTransactionTypeId
    FROM invoice WHERE invoice.uuid = invoice_uuid;

  SELECT cost INTO amountToAllocate FROM invoice WHERE uuid = invoice_uuid;

  -- set up the prepayment balances table
  CALL CalculatePrepaymentBalances(debtor_uuid);

  OPEN curse;

  allocatePrepayments: LOOP
    FETCH curse INTO recordUuid, recordBalance;

    -- if done, break
    IF done THEN
      LEAVE allocatePrepayments;
    END IF;

    -- This portion of the loop figures out how much to allocate.
    IF (amountToAllocate - recordBalance > 0) THEN
      -- Branch A: We have more to allocate than in this record, so we'll allocate
      -- the _entire_ record and keep looping.
      SET amountToAllocate = amountToAllocate - recordBalance;
      SET allocationAmount = recordBalance;
    ELSE
      -- Branch B: We have enough to cover the allocation amount in this record.
      -- Set the amount allocated to the amount required and then exit the loop.
      SET allocationAmount = amountToAllocate;
      SET amountToAllocate = 0;
      SET done = TRUE;
    END IF;

    INSERT INTO voucher_item (`uuid`, `account_id`, `debit`, `credit`, `voucher_uuid`, `document_uuid`, `entity_uuid`) VALUES (
      HUID(UUID()), debtorAccountId, allocationAmount, 0, vUuid, recordUuid, debtor_uuid
    );
  END LOOP allocatePrepayments;

  SET totalAllocated = (SELECT SUM(debit) from voucher_item WHERE voucher_uuid = vUuid);

  -- insert the final voucher item row that hits the invoice
  INSERT INTO voucher_item (`uuid`, `account_id`, `debit`, `credit`, `voucher_uuid`, `document_uuid`, `entity_uuid`)
  VALUES (HUID(UUID()), debtorAccountId, 0, totalAllocated, vUuid, invoice_uuid, debtor_uuid);

  UPDATE voucher SET amount = totalAllocated WHERE voucher.uuid = vUuid;

  CALL PostVoucher(vUuid);
END $$

CREATE PROCEDURE VerifyPrepaymentTemporaryTables()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_records (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), date TIMESTAMP,
    INDEX uuid (uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_references (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), date TIMESTAMP,
    INDEX uuid (uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_balances (
    uuid BINARY(16), balance DECIMAL(19, 4), date TIMESTAMP,
    INDEX uuid (uuid)
  );
END $$

CREATE PROCEDURE CalculatePrepaymentBalances(
  IN debtor_uuid BINARY(16)
)
BEGIN
  CALL VerifyPrepaymentTemporaryTables();

  -- pull in posting_journal data
  INSERT INTO stage_payment_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM posting_journal AS p
      JOIN cash c ON c.uuid = p.record_uuid
    WHERE c.debtor_uuid = debtor_uuid
      AND c.reversed = 0
      AND c.is_caution = 1
      AND p.entity_uuid IS NOT NULL;

  -- pull in general_ledger data
  INSERT INTO stage_payment_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM general_ledger AS p
      JOIN cash c ON c.uuid = p.record_uuid
    WHERE c.debtor_uuid = debtor_uuid
      AND c.reversed = 0
      AND c.is_caution = 1
      AND p.entity_uuid IS NOT NULL;

  -- pull in posting_journal references
  INSERT INTO stage_payment_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM posting_journal AS p
      JOIN cash c ON c.uuid = p.reference_uuid
    WHERE c.debtor_uuid = debtor_uuid AND c.reversed = 0 AND c.is_caution = 1;

  -- pull in general_ledger references
  INSERT INTO stage_payment_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM general_ledger AS p
      JOIN cash c ON c.uuid = p.reference_uuid
    WHERE c.debtor_uuid = debtor_uuid AND c.reversed = 0 AND c.is_caution = 1;

  INSERT INTO stage_payment_balances
    SELECT zz.uuid, zz.balance, zz.date
    FROM (
      SELECT ledger.uuid, SUM(ledger.credit - ledger.debit) AS balance, MIN(ledger.date) AS date
      FROM (
        SELECT records.uuid, records.debit, records.credit, records.date FROM stage_payment_records AS records
      UNION ALL
        SELECT refs.uuid, refs.debit, refs.credit, refs.date FROM stage_payment_references AS refs
      ) AS ledger
      GROUP BY ledger.uuid
      HAVING balance <> 0
    ) AS zz ORDER BY zz.date;
END $$


/*
PROCEDURE UnbalancedInvoicePayments

USAGE: Call UnbalancedInvoicePayments(dateFrom, dateTo);

Description:
This SP retrieves the balance of invoices made during a period of time.  It
filters out invoices that are reversed (they should be balanced by default),
as well as balanced invoices.

*/
DROP PROCEDURE IF EXISTS UnbalancedInvoicePayments$$
CREATE PROCEDURE UnbalancedInvoicePayments(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  -- This holds the invoices from the PJ/GL
  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  CREATE TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.
  SELECT em.text AS debtorReference, debtor.text AS debtorName, balances.debit_equiv AS debit,
    balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
     (balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )) AS paymentPercentage,
    dm.text AS reference
  FROM tmp_invoices_1 AS iv
    JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
    LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
    JOIN debtor ON debtor.uuid = iv.debtor_uuid
    LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
  ORDER BY iv.date;
END$$


-- this Procedure help to make quick analyse about unbalanced invoice
-- it create a table name 'unbalancedInvoices' that can be used by the analyser
DROP PROCEDURE IF EXISTS UnbalancedInvoicePaymentsTable$$
CREATE PROCEDURE UnbalancedInvoicePaymentsTable(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  -- This holds the invoices from the PJ/GL
  CREATE TEMPORARY TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.

  DROP TEMPORARY TABLE IF EXISTS unbalanced_invoices;
  CREATE TEMPORARY TABLE `unbalanced_invoices` AS (
    SELECT BUID(ivc.uuid) as invoice_uuid , em.text AS debtorReference, debtor.text AS debtorName,
      BUID(debtor.uuid) as debtorUuid,
      balances.debit_equiv AS debit,
      balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
      dm.text AS reference, ivc.project_id, p.name as 'projectName', dbtg.name as 'debtorGroupName',
      s.name as 'serviceName', s.id as 'serviceId',
      ((balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )*100)) AS paymentPercentage
    FROM tmp_invoices_1 AS iv
        JOIN invoice ivc ON ivc.uuid = iv.uuid
        JOIN service s On s.id = ivc.service_id
        JOIN debtor dbt ON ivc.debtor_uuid = dbt.uuid
        JOIN debtor_group dbtg ON dbtg.uuid = dbt.group_uuid
        JOIN project p ON p.id = ivc.project_id
      JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
      LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
      JOIN debtor ON debtor.uuid = iv.debtor_uuid
      LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
    ORDER BY iv.date
  );
END$$

DELIMITER ;
DELIMITER $$
/*

--------
OVERVIEW
--------

This procedures file contains procedures to ensure data integrity.  It allows an
administrator to merge two locations if they have database access. No clientside
scripts currently access these procedures, but we may write a client interface
in the future.
*/


/*
CALL MergeLocations()

DESCRIPTION
This procedure merges two locations by changing all references to a single uuid.
A "location" is synonymous with a village.uuid.  The first parameter is the
village to remove, and the second is the new village uuid.  A user might want to
do this when there are duplicated locations.
*/
CREATE PROCEDURE MergeLocations(
  IN beforeUuid BINARY(16),
  IN afterUuid BINARY(16)
) BEGIN

  -- Go through every location in the database, replacing the location uuid with the new location uuid
  UPDATE patient SET origin_location_id = afterUuid WHERE origin_location_id = beforeUuid;
  UPDATE patient SET current_location_id = afterUuid WHERE current_location_id = beforeUuid;

  UPDATE debtor_group SET location_id = afterUuid WHERE location_id = beforeUuid;

  UPDATE enterprise SET location_id = afterUuid WHERE location_id = beforeUuid;

  -- delete the beforeUuid village and leave the afterUuid village.
  DELETE FROM village WHERE village.uuid = beforeUuid;
END $$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS `UpdateStaffingIndices`$$
CREATE   PROCEDURE `UpdateStaffingIndices`(IN _dateFrom DATE, IN _dateTo DATE)
BEGIN
	DECLARE _id mediumint(8) unsigned;
	DECLARE _date_embauche DATE;
	DECLARE _employee_uuid, _grade_uuid, _current_staffing_indice_uuid, _last_staffing_indice_uuid BINARY(16);
	DECLARE _hiring_year, _fonction_id INT;
	DECLARE _grade_indice, _last_grade_indice, _function_indice DECIMAL(19,4);

	DECLARE done BOOLEAN;
	DECLARE curs1 CURSOR FOR 
	SELECT uuid, grade_uuid, fonction_id, date_embauche
		FROM employee;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

	OPEN curs1;
		read_loop: LOOP
		FETCH curs1 INTO _employee_uuid, _grade_uuid, _fonction_id, _date_embauche;
			IF done THEN
				LEAVE read_loop;
			END IF;
			-- anciennette
			SET _hiring_year = FLOOR(DATEDIFF(_dateTo, _date_embauche)/365);
			-- is there any staffing indice specified for the employee in this payroll config period interval ?
			-- _current_staffing_indice_uuid is the indice for this payroll config period interval
			SET _current_staffing_indice_uuid  = IFNULL((
				SELECT st.uuid
				FROM staffing_indice st
				WHERE st.employee_uuid = _employee_uuid AND (st.date BETWEEN _dateFrom AND _dateTo)
				LIMIT 1
			), HUID('0'));

			SET _last_staffing_indice_uuid  = IFNULL((
				SELECT st.uuid
				FROM staffing_indice st
				WHERE st.employee_uuid = _employee_uuid
				ORDER BY st.created_at DESC
				LIMIT 1
			), HUID('0'));

			SET @grade_indice_rate = 0.05;
			SET @shouldInsert = FALSE;
			
			-- check if the date_embauche is in the current payroll config period interval
			SET @hiring_date = DATE(CONCAT(YEAR(_dateTo), '-', MONTH(_date_embauche), '-', DAY(_date_embauche)));
			SET @date_embauche_interval = (@hiring_date BETWEEN _dateFrom AND _dateTo);
			
			-- should update staffing_indice and there's no previous staffing_indice for in this payroll config period interval
			IF  ((@date_embauche_interval=1)  AND (_current_staffing_indice_uuid = HUID('0'))) THEN
				-- increase the _last_grade_indice if it exist
				IF (_last_staffing_indice_uuid <> HUID('0')) THEN
					SET _last_grade_indice = (SELECT grade_indice FROM staffing_indice WHERE uuid = _last_staffing_indice_uuid);
					SET _grade_indice =  _last_grade_indice + (_last_grade_indice*@grade_indice_rate);
				ELSE
					SET _grade_indice = (SELECT IFNULL(value, 0)  FROM staffing_grade_indice WHERE grade_uuid = _grade_uuid LIMIT 1);
					SET _grade_indice = _grade_indice + (_grade_indice*_hiring_year*@grade_indice_rate);
				END IF;
				SET @shouldInsert = TRUE;
			
			-- no indice has been created for the employee previously(no record in the table for him)
			-- this is used when configuring for the first time
			ELSE
			 	IF ((@date_embauche_interval = 0) && (_last_staffing_indice_uuid = HUID('0'))) THEN
					SET _grade_indice = (SELECT IFNULL(value, 0)  FROM staffing_grade_indice WHERE grade_uuid = _grade_uuid LIMIT 1);
					SET _grade_indice = _grade_indice + (_grade_indice * _hiring_year * @grade_indice_rate);
					SET @shouldInsert = TRUE;
				END IF;
			END IF;

			IF @shouldInsert THEN
				SET _function_indice = (SELECT IFNULL(value, 0) FROM staffing_function_indice WHERE fonction_id = _fonction_id LIMIT 1);			
				INSERT INTO staffing_indice(uuid, employee_uuid, grade_uuid, fonction_id, grade_indice, function_indice, date)
				VALUES(HUID(uuid()), _employee_uuid,  _grade_uuid , _fonction_id, IFNULL(_grade_indice, 0), IFNULL(_function_indice, 0), _dateTo);
			END IF;
		END LOOP;
	CLOSE curs1;
END$$


-- sum of a column of indexes (index for each employee)
DROP FUNCTION IF EXISTS `sumTotalIndex`$$
CREATE FUNCTION `sumTotalIndex`(_payroll_configuration_id INT, _indice_type VARCHAR(50)) RETURNS DECIMAL(19, 4) DETERMINISTIC
BEGIN

	DECLARE _employee_uuid BINARY(16);
	DECLARE _employee_grade_indice, totals DECIMAL(19, 4);
  
  SET totals  = (
    SELECT SUM(rubric_value) as 'rubric_value'
		FROM stage_payment_indice sp
		JOIN rubric_payroll r ON r.id = sp.rubric_id
		WHERE  r.indice_type = _indice_type AND	 payroll_configuration_id = _payroll_configuration_id
  );

	RETURN IFNULL(totals, 1);
END$$

DROP FUNCTION IF EXISTS `getStagePaymentIndice`$$
CREATE  FUNCTION `getStagePaymentIndice`(_employee_uuid BINARY(16), 
_payroll_configuration_id INT, _indice_type VARCHAR(50) ) RETURNS DECIMAL(19, 4) DETERMINISTIC
BEGIN
	return IFNULL((SELECT SUM(rubric_value) as 'rubric_value'
		FROM stage_payment_indice sp
		JOIN rubric_payroll r ON r.id = sp.rubric_id
		WHERE sp.employee_uuid = _employee_uuid AND r.indice_type = _indice_type AND	
			payroll_configuration_id = _payroll_configuration_id
		LIMIT 1), 0);
END;


DROP PROCEDURE IF EXISTS `addStagePaymentIndice`$$
CREATE   PROCEDURE `addStagePaymentIndice`( 
	IN _employee_uuid BINARY(16),IN _payroll_configuration_id INT(10),

	IN _indice_type VARCHAR(50), IN _value DECIMAL(19, 10)
)
BEGIN
   DECLARE _rubric_id INT;
   DECLARE _stage_payment_uuid BINARY(16);

   SELECT id INTO _rubric_id FROM rubric_payroll WHERE indice_type = _indice_type LIMIT 1;
 	
   IF _rubric_id > 0 THEN 
	SET _stage_payment_uuid = IFNULL((
		SELECT sp.uuid 
		FROM stage_payment_indice sp
		JOIN rubric_payroll r ON r.id = sp.rubric_id
		WHERE sp.employee_uuid = _employee_uuid AND r.indice_type = _indice_type AND	
			payroll_configuration_id = _payroll_configuration_id
		LIMIT 1), HUID('0')
	);
   IF _stage_payment_uuid <> HUID('0') THEN
	DELETE FROM stage_payment_indice  WHERE uuid = _stage_payment_uuid;
   END IF;

   INSERT INTO stage_payment_indice
   	(uuid,employee_uuid, payroll_configuration_id, rubric_id, rubric_value ) VALUES
    (HUID(uuid()), _employee_uuid, _payroll_configuration_id, _rubric_id, _value);
  END IF;
END $$


DROP PROCEDURE IF EXISTS `updateIndices`$$
CREATE   PROCEDURE `updateIndices`( IN _payroll_configuration_id INT)
BEGIN

	DECLARE _employee_uuid BINARY(16);
	DECLARE _employee_grade_indice, _sumTotalCode,  _function_indice DECIMAL(19, 4);
	
	DECLARE done BOOLEAN;
	DECLARE curs1 CURSOR FOR 
	SELECT cei.employee_uuid 
	FROM payroll_configuration pc
	JOIN config_employee ce ON ce.id = pc.config_employee_id
	JOIN config_employee_item cei ON cei.config_employee_id = ce.id
	WHERE pc.id = _payroll_configuration_id;

  DECLARE curs2 CURSOR FOR 
	SELECT cei.employee_uuid 
	FROM payroll_configuration pc
	JOIN config_employee ce ON ce.id = pc.config_employee_id
	JOIN config_employee_item cei ON cei.config_employee_id = ce.id
	WHERE pc.id = _payroll_configuration_id;


	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	
	OPEN curs1;
		read_loop: LOOP
		FETCH curs1 INTO _employee_uuid;
			IF done THEN
				LEAVE read_loop;
			END IF;

			SELECT st.grade_indice, st.function_indice
			INTO _employee_grade_indice, _function_indice
			FROM staffing_indice st
			WHERE st.employee_uuid = _employee_uuid
			ORDER BY st.created_at DESC
			LIMIT 1;
						
			CALL addStagePaymentIndice( _employee_uuid,_payroll_configuration_id,'is_base_index', IFNULL(_employee_grade_indice, 0));
			
			SET @responsabilite = IFNULL(_function_indice, 0);
			CALL addStagePaymentIndice( _employee_uuid,_payroll_configuration_id,'is_responsability', @responsabilite);
									
			-- tot jrs
			SET @tot_jrs = getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_day_worked') +
				 getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_extra_day');

			CALL addStagePaymentIndice( _employee_uuid,_payroll_configuration_id,'is_total_days', IFNULL(@tot_jrs, 0));
			
			-- 
			SET @nbrJour = 0;
			SET @envelopPaie = 0;
			-- get pay_envelope from staffing_indice_parameters table
			SELECT IFNULL(pay_envelope, 0), IFNULL(working_days, 0) 
			INTO @envelopPaie, @nbrJour 
			FROM staffing_indice_parameters
			WHERE payroll_configuration_id = _payroll_configuration_id;
			

			SET @indiceBase = getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_base_index');
		    -- A revoir le calcul
			-- SET @indiceJour = maxBaseIndice(_payroll_configuration_id)/@nbrJour;
			SET @indiceJour = IFNULL(@indiceBase/@nbrJour, 0);
			
			CALL addStagePaymentIndice( _employee_uuid, _payroll_configuration_id,'is_day_index', @indiceJour);
			CALL addStagePaymentIndice( _employee_uuid, _payroll_configuration_id,'is_number_of_days', @nbrJour);
		
			-- indice reajust = @indiceJour*(tot jrs)
			SET @indice_reajust = IFNULL(@indiceJour*@tot_jrs, 0);
		
			CALL addStagePaymentIndice( _employee_uuid, _payroll_configuration_id,'is_reagistered_index', @indice_reajust);
			
			-- other profits
			SET @otherProfits = getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_other_profits');
	
  
			CALL addStagePaymentIndice( _employee_uuid, _payroll_configuration_id, 'is_total_code', 
				@indice_reajust  + @responsabilite  + @otherProfits
			);
			
		END LOOP;
	CLOSE curs1;

	-- pay_rate = @envelopPaie / (sum total code) // Masse de paie
	SET _sumTotalCode = sumTotalIndex(_payroll_configuration_id, 'is_total_code');
  SET done = FALSE;

  OPEN curs2;
		read_loop: LOOP
		FETCH curs2 INTO _employee_uuid;
			IF done THEN
				LEAVE read_loop;
			END IF;
  
			CALL addStagePaymentIndice( _employee_uuid,_payroll_configuration_id,'is_pay_rate', @envelopPaie/_sumTotalCode);
			-- sal de base
			SET @sal_de_base = getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_total_code')*
				getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_pay_rate');

			CALL addStagePaymentIndice( _employee_uuid,_payroll_configuration_id,'is_gross_salary', IFNULL(@sal_de_base, 0));

			UPDATE employee SET individual_salary = getStagePaymentIndice(_employee_uuid, _payroll_configuration_id, 'is_gross_salary')
			WHERE uuid = _employee_uuid;

  		END LOOP;
	CLOSE curs2;

END$$

DELIMITER ;
DELIMITER $$
CREATE PROCEDURE superUserRole(IN user_id INT)
BEGIN

    DECLARE roleUUID BINARY(16);

    SET roleUUID = HUID(UUID());

    INSERT INTO role(uuid, label)
    VALUES(roleUUID, 'Administrateur');

    INSERT INTO role_unit
    SELECT HUID(uuid()) as uuid,roleUUID, id FROM unit;

    INSERT INTO user_role(uuid, user_id, role_uuid)
    VALUES(HUID(uuid()), user_id, roleUUID);

    INSERT INTO role_actions(uuid, role_uuid, actions_id)
    SELECT HUID(uuid()) as uuid, roleUUID, id FROM actions;
END $$
DELIMITER ;
DELIMITER $$

-- stock consumption
CREATE PROCEDURE ComputeStockConsumptionByPeriod (
  IN inventory_uuid BINARY(16),
  IN depot_uuid BINARY(16),
  IN period_id MEDIUMINT(8),
  IN movementQuantity INT(11)
)
BEGIN
  INSERT INTO `stock_consumption` (`inventory_uuid`, `depot_uuid`, `period_id`, `quantity`) VALUES
    (inventory_uuid, depot_uuid, period_id, movementQuantity)
  ON DUPLICATE KEY UPDATE `quantity` = `quantity` + movementQuantity;
END $$

-- compute stock consumption
CREATE PROCEDURE ComputeStockConsumptionByDate (
  IN inventory_uuid BINARY(16),
  IN depot_uuid BINARY(16),
  IN movementDate DATE,
  IN movementQuantity INT(11)
)
BEGIN
  INSERT INTO `stock_consumption` (`inventory_uuid`, `depot_uuid`, `period_id`, `quantity`)
    SELECT inventory_uuid, depot_uuid, p.id, movementQuantity
    FROM period p
    WHERE DATE(movementDate) BETWEEN DATE(p.start_date) AND DATE(p.end_date)
  ON DUPLICATE KEY UPDATE `quantity` = `quantity` + movementQuantity;
END $$

-- post stock movement into vouchers
DROP PROCEDURE IF EXISTS PostStockMovement;
CREATE PROCEDURE PostStockMovement (
  IN documentUuid BINARY(16),
  IN isExit TINYINT(1),
  IN projectId SMALLINT(5),
  IN currencyId SMALLINT(5)
)
BEGIN
  -- voucher
  DECLARE voucher_uuid BINARY(16);
  DECLARE voucher_date DATETIME;
  DECLARE voucher_project_id SMALLINT(5);
  DECLARE voucher_currency_id SMALLINT(5);
  DECLARE voucher_user_id SMALLINT(5);
  DECLARE voucher_type_id SMALLINT(3);
  DECLARE voucher_description TEXT;
  DECLARE voucher_amount DECIMAL(19, 4);

  -- voucher item
  DECLARE voucher_item_uuid BINARY(16);
  DECLARE voucher_item_account INT(10);
  DECLARE voucher_item_account_debit DECIMAL(19, 4);
  DECLARE voucher_item_account_credit DECIMAL(19, 4);
  DECLARE voucher_item_voucher_uuid BINARY(16);
  DECLARE voucher_item_document_uuid BINARY(16);

  -- variables
  DECLARE v_stock_account INT(10);
  DECLARE v_cogs_account INT(10);
  DECLARE v_unit_cost DECIMAL(19, 4);
  DECLARE v_quantity INT(11);
  DECLARE v_document_uuid BINARY(16);
  DECLARE v_is_exit TINYINT(1);
  DECLARE v_item_description TEXT;

  -- transaction type
  DECLARE STOCK_EXIT_TYPE SMALLINT(5) DEFAULT 13;
  DECLARE STOCK_ENTRY_TYPE SMALLINT(5) DEFAULT 14;

  -- variables for checking invalid accounts
  DECLARE ERR_INVALID_INVENTORY_ACCOUNTS CONDITION FOR SQLSTATE '45006';
  DECLARE v_has_invalid_accounts SMALLINT(5);

  -- cursor declaration
  DECLARE v_finished INTEGER DEFAULT 0;

  DECLARE stage_stock_movement_cursor CURSOR FOR
    SELECT temp.stock_account, temp.cogs_account, temp.unit_cost, temp.quantity, temp.document_uuid, temp.is_exit, temp.item_description
  FROM stage_stock_movement as temp;

  -- variables for the cursor
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1;

  -- Check that every inventory has a stock account and a variation account
  -- if they do not, the transaction will be Unbalanced, so the operation will not continue
  SELECT COUNT(l.uuid)
    INTO v_has_invalid_accounts
  FROM stock_movement AS sm
  JOIN lot l ON l.uuid = sm.lot_uuid
  JOIN inventory i ON i.uuid = l.inventory_uuid
  JOIN inventory_group ig ON ig.uuid = i.group_uuid
  WHERE ig.stock_account IS NULL AND ig.cogs_account IS NULL AND sm.document_uuid = documentUuid AND sm.is_exit = isExit;

  IF (v_has_invalid_accounts > 0) THEN
    SIGNAL ERR_INVALID_INVENTORY_ACCOUNTS SET MESSAGE_TEXT = 'Every inventory should belong to a group with a cogs account and stock account.';
  END IF;

  -- temporarise the stock movement
  CREATE TEMPORARY TABLE stage_stock_movement (
      SELECT
        projectId as project_id, currencyId as currency_id,
        CONCAT(ig.name, ' - ', m.quantity, ' ', iu.text, ' of ', i.text , ' (', l.label, ')') AS item_description,
        m.uuid, m.description, m.date, m.flux_id, m.is_exit, m.document_uuid, m.quantity, m.unit_cost, m.user_id,
        ig.cogs_account, ig.stock_account
      FROM stock_movement m
      JOIN depot d ON d.uuid = m.depot_uuid
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN inventory_group ig
        ON ig.uuid = i.group_uuid AND (ig.stock_account IS NOT NULL AND ig.cogs_account IS NOT NULL)
      WHERE m.document_uuid = documentUuid AND m.is_exit = isExit
    );

  -- define voucher variables
  SELECT HUID(UUID()), date, project_id, currency_id, user_id, description, SUM(unit_cost * quantity)
    INTO voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id, voucher_description, voucher_amount
  FROM stage_stock_movement;

  IF (isExit = 1) THEN
    SET voucher_type_id = STOCK_EXIT_TYPE;
  ELSE
    SET voucher_type_id = STOCK_ENTRY_TYPE;
  END IF;

  -- insert into voucher
  INSERT INTO voucher (uuid, date, project_id, currency_id, user_id, type_id, description, amount) VALUES (
    voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id,
    voucher_type_id, voucher_description, voucher_amount
  );

  -- handle voucher items via cursor
  OPEN stage_stock_movement_cursor;

  -- loop in the cursor
  insert_voucher_item : LOOP

    FETCH stage_stock_movement_cursor INTO v_stock_account, v_cogs_account, v_unit_cost, v_quantity, v_document_uuid, v_is_exit, v_item_description;

    IF v_finished = 1 THEN
      LEAVE insert_voucher_item;
    END IF;

    if (v_is_exit = 1) THEN
      SET voucher_item_account_debit = v_cogs_account;
      SET voucher_item_account_credit = v_stock_account;
    ELSE
      SET voucher_item_account_debit = v_stock_account;
      SET voucher_item_account_credit = v_cogs_account;
    END IF;

    -- insert debit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
      VALUES (HUID(UUID()), voucher_item_account_debit, (v_unit_cost * v_quantity), 0, voucher_uuid, v_document_uuid, v_item_description);

    -- insert credit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
      VALUES (HUID(UUID()), voucher_item_account_credit, 0, (v_unit_cost * v_quantity), voucher_uuid, v_document_uuid, v_item_description);

  END LOOP insert_voucher_item;

  -- close the cursor
  CLOSE stage_stock_movement_cursor;

  -- drop the stage tabel
  DROP TEMPORARY TABLE stage_stock_movement;

  -- post voucher into journal
  CALL PostVoucher(voucher_uuid);
END $$

/*
  ---------------------------------------------------
  Import Stock Procedure
  ---------------------------------------------------
*/
DROP PROCEDURE IF EXISTS ImportStock;
CREATE PROCEDURE ImportStock (
  IN enterpriseId SMALLINT(5),
  IN projectId SMALLINT(5),
  IN userId SMALLINT(5),
  IN depotUuid BINARY(16),
  IN documentUuid BINARY(16),
  IN inventoryGroupName VARCHAR(100),
  IN inventoryCode VARCHAR(30),
  IN inventoryText VARCHAR(100),
  IN inventoryType VARCHAR(30),
  IN inventoryUnit VARCHAR(30),
  IN inventoryUnitCost DECIMAL(10, 4),
  IN inventoryCmm DECIMAL(10, 4),
  IN stockLotLabel VARCHAR(191),
  IN stockLotQuantity INT(11),
  IN stockLotExpiration DATE
)
BEGIN
  DECLARE existInventory TINYINT(1);
  DECLARE existLot TINYINT(1);

  DECLARE inventoryUuid BINARY(16);
  DECLARE integrationUuid BINARY(16);
  DECLARE lotUuid BINARY(16);
  DECLARE fluxId INT(11);

  /*
    =======================================================================
    check if the inventory exist
    =======================================================================

    if the inventory exists we will use it, if not we will create a new one
  */
  SET existInventory = (SELECT IF((SELECT COUNT(`text`) AS total FROM `inventory` WHERE `text` = inventoryText) > 0, 1, 0));

  IF (existInventory = 1) THEN

    /* the inventory exists so we have to get its uuid (inventoryUuid) for using it */
    SELECT inventory.uuid, inventory.code INTO inventoryUuid, inventoryCode FROM inventory WHERE `text` = inventoryText LIMIT 1;

  ELSE

    /* the inventory doesn't exists so we have to create a new one */
    IF (inventoryCode = NULL OR inventoryCode = '' OR inventoryCode = 'NULL') THEN

      /* if the inventory code is missing, create a new one randomly */
      SET inventoryCode = (SELECT ROUND(RAND() * 10000000));

    END IF;

    /* call the procedure ImportInventory for creating a new inventory and its dependencies */
    CALL ImportInventory(enterpriseId, inventoryGroupName, inventoryCode, inventoryText, inventoryType, inventoryUnit, inventoryUnitCost);

    /* set the inventory uuid */
    SET inventoryUuid = (SELECT `uuid` FROM inventory WHERE `text` = inventoryText AND `code` = inventoryCode);

  END IF;

  /* update the consumption (avg_consumption) */
  UPDATE inventory SET avg_consumption = inventoryCmm WHERE `uuid` = inventoryUuid;

  /*
    =======================================================================
    check if the lot exists in the depot
    =======================================================================

    if the lot exists we will use it, if not we will create a new one
  */
  SET existLot = (SELECT IF((SELECT COUNT(*) AS total FROM `stock_movement` JOIN `lot` ON `lot`.`uuid` = `stock_movement`.`lot_uuid` WHERE `stock_movement`.`depot_uuid` = depotUuid AND `lot`.`inventory_uuid` = inventoryUuid AND `lot`.`label` = stockLotLabel) > 0, 1, 0));

  IF (existLot = 1) THEN

    /* if the lot exist use its uuid */
    SET lotUuid = (SELECT `stock_movement`.`lot_uuid` FROM `stock_movement` JOIN `lot` ON `lot`.`uuid` = `stock_movement`.`lot_uuid` WHERE `stock_movement`.`depot_uuid` = depotUuid AND `lot`.`inventory_uuid` = inventoryUuid AND `lot`.`label` = stockLotLabel LIMIT 1);

  ELSE

    /* create integration info for the lot */
    SET integrationUuid = HUID(UUID());
    INSERT INTO integration (`uuid`, `project_id`, `date`)
    VALUES (integrationUuid, projectId, CURRENT_DATE());

    /* create the lot */
    SET lotUuid = HUID(UUID());
    INSERT INTO lot (`uuid`, `label`, `initial_quantity`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`, `origin_uuid`)
    VALUES (lotUuid, stockLotLabel, stockLotQuantity, stockLotQuantity, inventoryUnitCost, DATE(stockLotExpiration), inventoryUuid, integrationUuid);

  END IF;


  /* create the stock movement */
  /* 13 is the id of integration flux */
  SET fluxId = 13;
  INSERT INTO stock_movement (`uuid`, `document_uuid`, `depot_uuid`, `lot_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`)
  VALUES (HUID(UUID()), documentUuid, depotUuid, lotUuid, fluxId, CURRENT_DATE(), stockLotQuantity, inventoryUnitCost, 0, userId);
END $$

DROP PROCEDURE IF EXISTS `stockValue`$$
CREATE PROCEDURE `stockValue`(
  IN depotUuid BINARY(16),
  IN dateTo DATE,
  IN currencyId INT
  )
BEGIN
  DECLARE done BOOLEAN;
  DECLARE mvtIsExit tinyint(1);
  DECLARE mvtQtt, stockQtt, newQuantity INT(11);
  DECLARE mvtUnitCost, mvtValue, newValue, newCost, exchangeRate, stockUnitCost, stockValue DECIMAL(19, 4);

  DECLARE _documentReference VARCHAR(100);
  DECLARE _date DATETIME;
  DECLARE _inventoryUuid BINARY(16);
  DECLARE _iteration, _newStock, _enterpriseId INT;


  DECLARE curs1 CURSOR FOR
    SELECT i.uuid, m.is_exit, l.unit_cost, m.quantity, m.date, dm.text AS documentReference
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.depot_uuid = depotUuid AND DATE(m.date) <= dateTo
    ORDER BY i.text, m.created_at ASC;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DROP TEMPORARY TABLE IF EXISTS stage_movement;
  CREATE TEMPORARY TABLE stage_movement(
    inventory_uuid BINARY(16),
    isExit TINYINT(1),
    qtt INT(11),
    unit_cost DECIMAL(19, 4),
    VALUE DECIMAL(19, 4),
    DATE DATETIME,
    reference VARCHAR(100),
    stockQtt INT(11),
    stockUnitCost DECIMAL(19, 4),
    stockValue DECIMAL(19, 4),
    iteration INT
  );

  SET _enterpriseId = (SELECT enterprise_id FROM depot WHERE uuid= depotUuid);
  SET exchangeRate = IFNULL(GetExchangeRate(_enterpriseId,currencyId ,dateTo), 1);

  OPEN curs1;
    read_loop: LOOP

    FETCH curs1 INTO _inventoryUuid, mvtIsExit, mvtUnitCost, mvtQtt, _date, _documentReference;
      IF done THEN
        LEAVE read_loop;
      END IF;

      SELECT COUNT(inventory_uuid) INTO _newStock FROM stage_movement WHERE inventory_uuid = _inventoryUuid;

      -- initialize stock qtt, value and unit cost for a new inventory
      IF _newStock = 0 THEN
        SET _iteration = 0;

        SET stockQtt= 0;
        SET stockUnitCost = 0;
        SET stockValue = 0;

        SET mvtValue = 0;
        SET newQuantity = 0;
        SET newValue = 0;
        SET newCost = 0;
      END IF;

      SET mvtUnitCost = mvtUnitCost * (exchangeRate);

      -- stock exit movement, the stock quantity decreases
      IF mvtIsExit = 1 THEN
        SET stockQtt = stockQtt - mvtQtt;
        SET stockValue = stockQtt * stockUnitCost;
        -- ignore negative stock value
        IF stockValue < 0 THEN
          SET stockValue = 0;
        END IF;
      ELSE
        -- stock entry movement, the stock quantity increases
        SET newQuantity = mvtQtt + stockQtt;

        -- ignore negative stock value
        IF stockValue < 0 THEN
          SET newValue = mvtUnitCost * mvtQtt;
        ELSE
          SET newValue = (mvtUnitCost * mvtQtt) + stockValue;
        END IF;

        -- don't use cumulated quantity when stock quantity < 0
        -- in this case use movement quantity only
        IF stockQtt < 0 THEN
          SET newCost = newValue / IF(mvtQtt = 0, 1, mvtQtt);
        ELSE
          SET newCost = newValue / IF(newQuantity = 0, 1, newQuantity);
        END IF;

        SET stockQtt = newQuantity;
        SET stockUnitCost = newCost;
        SET stockValue = newValue;
      END IF;

      INSERT INTO stage_movement VALUES (
        _inventoryUuid, mvtIsExit, mvtQtt, stockQtt, mvtQtt * mvtUnitCost, _date, _documentReference,  stockQtt, stockUnitCost, stockValue, _iteration
      );
      SET _iteration = _iteration + 1;
    END LOOP;
  CLOSE curs1;

  DROP TEMPORARY TABLE IF EXISTS stage_movement_copy;
  CREATE TEMPORARY TABLE stage_movement_copy AS SELECT * FROM stage_movement;

  -- inventory stock
  SELECT  BUID(sm.inventory_uuid) AS inventory_uuid, i.text as inventory_name,  sm.stockQtt, sm.stockUnitCost, sm.stockValue
  FROM stage_movement sm
  JOIN inventory i ON i.uuid = sm.inventory_uuid
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration
  ORDER BY i.text ASC;

  -- total in stock
  SELECT SUM(sm.stockValue) as total
  FROM stage_movement as sm
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration;

END $$

DELIMITER ;
DELIMITER $$
/*
 Create Fiscal Year and Periods

This procedure help to create fiscal year and fiscal year's periods
periods include period `0` and period `13`
*/

DROP PROCEDURE IF EXISTS CreateFiscalYear$$
CREATE PROCEDURE CreateFiscalYear(
  IN p_enterprise_id SMALLINT(5),
  IN p_previous_fiscal_year_id MEDIUMINT(8),
  IN p_user_id SMALLINT(5),
  IN p_label VARCHAR(50),
  IN p_number_of_months MEDIUMINT(8),
  IN p_start_date DATE,
  IN p_end_date DATE,
  IN p_note TEXT,
  OUT fiscalYearId MEDIUMINT(8)
)
BEGIN
  INSERT INTO fiscal_year (
    `enterprise_id`, `previous_fiscal_year_id`, `user_id`, `label`,
    `number_of_months`, `start_date`, `end_date`, `note`
  ) VALUES (
    p_enterprise_id, p_previous_fiscal_year_id, p_user_id, p_label,
    p_number_of_months, p_start_date, p_end_date, p_note
  );

  SET fiscalYearId = LAST_INSERT_ID();
  CALL CreatePeriods(fiscalYearId);
END $$

DROP PROCEDURE IF EXISTS GetPeriodRange$$
CREATE PROCEDURE GetPeriodRange(
  IN fiscalYearStartDate DATE,
  IN periodNumberIndex SMALLINT(5),
  OUT periodStartDate DATE,
  OUT periodEndDate DATE
) BEGIN
  DECLARE `innerDate` DATE;

  SET innerDate = (SELECT DATE_ADD(fiscalYearStartDate, INTERVAL periodNumberIndex-1 MONTH));
  SET periodStartDate = (SELECT CAST(DATE_FORMAT(innerDate ,'%Y-%m-01') as DATE));
  SET periodEndDate = (SELECT LAST_DAY(innerDate));
END $$

DROP PROCEDURE IF EXISTS CreatePeriods$$
CREATE PROCEDURE CreatePeriods(
  IN fiscalYearId MEDIUMINT(8)
)
BEGIN
  DECLARE periodId MEDIUMINT(8);
  DECLARE periodNumber SMALLINT(5) DEFAULT 0;
  DECLARE periodStartDate DATE;
  DECLARE periodEndDate DATE;
  DECLARE periodLocked TINYINT(1);

  DECLARE fyEnterpriseId SMALLINT(5);
  DECLARE fyNumberOfMonths MEDIUMINT(8) DEFAULT 0;
  DECLARE fyLabel VARCHAR(50);
  DECLARE fyStartDate DATE;
  DECLARE fyEndDate DATE;
  DECLARE fyPreviousFYId SMALLINT(5);
  DECLARE fyLocked TINYINT(1);
  DECLARE fyCreatedAt TIMESTAMP;
  DECLARE fyUpdatedAt TIMESTAMP;
  DECLARE fyUserId MEDIUMINT(5);
  DECLARE fyNote TEXT;

  -- get the fiscal year informations
  SELECT
    enterprise_id, number_of_months, label, start_date, end_date,
    previous_fiscal_year_id, locked, created_at, updated_at, user_id, note
    INTO
    fyEnterpriseId, fyNumberOfMonths, fyLabel, fyStartDate, fyEndDate,
    fyPreviousFYId, fyLocked, fyCreatedAt, fyUpdatedAt, fyUserId, fyNote
  FROM fiscal_year WHERE id = fiscalYearId;

  -- insert N+1 period
  WHILE periodNumber <= fyNumberOfMonths + 1 DO

    IF periodNumber = 0 THEN
      -- Extremum periods 0 and N+1
      -- Insert periods with null dates - period id is YYYY00
      INSERT INTO period (`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (CONCAT(YEAR(fyStartDate), periodNumber), fiscalYearId, periodNumber, NULL, NULL, 0);

    ELSEIF periodNumber = fyNumberOfMonths + 1 THEN
      -- Extremum periods N+1
      -- Insert periods with null dates - period id is YYYY13
      INSERT INTO period (`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (CONCAT(YEAR(fyStartDate), periodNumber), fiscalYearId, periodNumber, NULL, NULL, 0);

    ELSE
      -- Normal periods
      -- Get period dates range
      CALL GetPeriodRange(fyStartDate, periodNumber, periodStartDate, periodEndDate);

      -- Inserting periods -- period id is YYYYMM
      INSERT INTO period(`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (DATE_FORMAT(periodStartDate, '%Y%m'), fiscalYearId, periodNumber, periodStartDate, periodEndDate, 0);
    END IF;

    SET periodNumber = periodNumber + 1;
    
    call UpdatePeriodLabels();
  END WHILE;
END $$



DROP PROCEDURE IF EXISTS `UpdatePeriodLabels`$$
CREATE PROCEDURE `UpdatePeriodLabels`()
BEGIN
DECLARE _id mediumint(8) unsigned;
DECLARE _start_date DATE;

DECLARE done BOOLEAN;
DECLARE curs1 CURSOR FOR 
   SELECT id, start_date FROM period;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN curs1;
    read_loop: LOOP
    FETCH curs1 INTO _id, _start_date;
        IF done THEN
            LEAVE read_loop;
        END IF;
         UPDATE period SET 
			  period.translate_key = CONCAT('TABLE.COLUMNS.DATE_MONTH.', UPPER(DATE_FORMAT(_start_date, "%M"))),
			  period.year =  YEAR(_start_date)
			WHERE period.id = _id;
    END LOOP;
CLOSE curs1;
END$$

/*
CALL CloseFiscalYear();

DESCRIPTION
This procedure closes a fiscal year in the follow way:
 1. Look up the next fiscal year.  You can only close a fiscal year if you
have a subsequent fiscal year created.
 2. Retrieve the balances for every account by summing the period_totals.
 3. Find the balance of income and expense accounts by summing both groups and
subtracting the total income from the total expense.
 4. Write the balances of every account that isn't an income or expense account
to the period 0 of the subsequent year.
 5. Write the balance of income and expense accounts (step 3) to the period 0
value of the account provided. If this account had a previous value, add the two
to get the final opening balance.

TODO - check that there are no unposted records from previous years.
*/
DROP PROCEDURE IF EXISTS CloseFiscalYear$$
CREATE PROCEDURE CloseFiscalYear(
  IN fiscalYearId MEDIUMINT UNSIGNED,
  IN closingAccountId INT UNSIGNED
)
BEGIN
  DECLARE NoSubsequentFiscalYear CONDITION FOR SQLSTATE '45010';
  DECLARE nextFiscalYearId MEDIUMINT UNSIGNED;
  DECLARE nextPeriodZeroId MEDIUMINT UNSIGNED;
  DECLARE currentFiscalYearClosingPeriod INT;

  DECLARE incomeAccountType SMALLINT;
  DECLARE expenseAccountType SMALLINT;

  -- constants
  SET incomeAccountType = 4;
  SET expenseAccountType = 5;

  -- find the subsequent fiscal year
  SET nextFiscalYearId = (
    SELECT id FROM fiscal_year
    WHERE previous_fiscal_year_id = fiscalYearId
    LIMIT 1
  );

  -- get the current fiscal year date
  SET currentFiscalYearClosingPeriod = (
    SELECT period.id FROM period WHERE period.fiscal_year_id = fiscalYearId ORDER BY period.number DESC LIMIT 1
  );

  IF nextFiscalYearId IS NULL THEN
    SIGNAL NoSubsequentFiscalYear
    SET MESSAGE_TEXT =
      'A fiscal year can only be closed into a subsequent fiscal year.  There is no following year for this fiscal year.';
  END IF;

  -- find the period id of the period 0 for the subsequent fiscal year
  SET nextPeriodZeroId = (
    SELECT period.id FROM period
    WHERE period.fiscal_year_id = nextFiscalYearId AND period.number = 0
  );

  -- create the fiscal year balances
  CREATE TEMPORARY TABLE FiscalYearBalances AS
    SELECT a.id, MAX(fy.id) AS fiscal_year_id, MAX(fy.enterprise_id) AS enterprise_id,
      SUM(pt.credit) AS credit, SUM(pt.debit) AS debit,
      SUM(pt.debit - pt.credit) AS balance, MAX(a.type_id) AS type_id
    FROM period_total AS pt
      JOIN account AS a ON pt.account_id = a.id
      JOIN account_type AS at ON a.type_id = at.id
      JOIN fiscal_year AS fy ON pt.fiscal_year_id = fy.id
    WHERE pt.fiscal_year_id = fiscalYearId
    GROUP BY a.id
    ORDER BY a.number;

  -- reverse the income/expense accounts in closing period into the closing account
  -- If they have a debit balance, credit them the difference, if they have a
  -- credit balance, debit them the difference
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, fyb.fiscal_year_id, currentFiscalYearClosingPeriod, fyb.id,
    IF(fyb.debit > fyb.credit, fyb.debit - fyb.credit, 0),
    IF(fyb.debit < fyb.credit, fyb.credit - fyb.debit, 0)
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id IN (incomeAccountType, expenseAccountType);

  -- sum all income/expense accounts from the fiscal year into the closing
  -- account in the closing period
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, fyb.fiscal_year_id, currentFiscalYearClosingPeriod,
    closingAccountId, SUM(fyb.credit) credit, SUM(fyb.debit) debit
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id IN (incomeAccountType, expenseAccountType)
  GROUP BY fyb.enterprise_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- copy all balances of non-income and non-expense accounts as the opening
  -- balance of the next fiscal year.  Leaving off the closing account, since it
  -- will be migrated from the closing period.
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, nextFiscalYearId, nextPeriodZeroId, fyb.id,
    fyb.credit, fyb.debit
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id NOT IN (incomeAccountType, expenseAccountType)
    AND fyb.id <> closingAccountId;

  -- now bring over the closing account from the closing period
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT enterprise_id, nextFiscalYearId, nextPeriodZeroId, account_id, credit, debit
  FROM period_total
  WHERE period_id = currentFiscalYearClosingPeriod
    AND account_id = closingAccountId;

  -- lock the fiscal year and associated periods
  UPDATE fiscal_year SET locked = 1 WHERE id = fiscalYearId;
  UPDATE period SET locked = 1 WHERE fiscal_year_id = fiscalYearId;
END $$

DELIMITER ;
DELIMITER $$

/*

--------
OVERVIEW
--------

This file contains the logic for safeguarding the general_ledger from invalid
transaction by enforcing a series of checks, known as the Trial Balance.  The
end result is 0 or more errors returned to the client as well as a preview of
how the account balances will change once the data is transferred from the
posting_journal to the general_ledger.

Since much preprocessing is required, several temporary tables are used.  This
allows the data to enter SQL as quickly as possible and leverage INDEXes, JOINs,
and GROUP BYs as quickly as possible.

---------
SCENARIOS
---------

There are several reasons why a transaction might fail a trial balance check.
We will discuss a few of them below:

ADDING TO LOCKED FISCAL YEARS
-----------------------------
Once an accountant has approved of the end of year report, the previous fiscal
year is generally locked and balance accounts are carried forward while income
and expense accounts are zeroed out.  This operation ensures that the general
ledger will remain faithful to the last audit.

However, a user may potentially generate transactions for a previous fiscal
year.  These transactions may not be malicious in intent - some unexpected prior
invoices may need to be added after a year has been locked.  The Trial Balance
will block these invoices from being posted, requiring that the accountant
carefully review why these transactions.  If they are valid, the accountant may
unlock the fiscal year and post them.


LOCKED ACCOUNTS
---------------
An accountant may close down an account in the system for any reason - perhaps
to remove a duplication, perhaps to indicate that a client will no longer be
serviced by the hospital.  This operation can be achieved by locking the account
in the accounts management page.  If there are pending transactions, these will
be blocked from posting until a decision can be made about them.
*/




/*
CALL StageTrialBalanceTransaction()

DESCRIPTION
Copies the transaction into a staging table to be quickly operated on.
*/
CREATE PROCEDURE StageTrialBalanceTransaction(
  IN record_uuid BINARY(16)
)
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_trial_balance_transaction (record_uuid BINARY(16));
  INSERT INTO stage_trial_balance_transaction SET stage_trial_balance_transaction.record_uuid = record_uuid;
END $$

/*
CALL TrialBalanceErrors()

DESCRIPTION
This stored procedure validates records that are used in the Trial Balance before they are posted
to the General Ledger.  The records are run through a series of SQL queries to validate their
correctness.  The follow assertions are made:
 1. The transaction dates are within the identified period
 2. Every line has some sort of description (best practice)
 3. All affected periods are unlocked.
 4. All affected accounts are unlocked.
 5. All transactions are balanced.
 6. All transactions have at least two lines (required for double-entry accounting)

Please be sure to stage all transactions for use via the StageTrialBalanceTransaction()
call.

SAMPLE OUTPUT
Running this query will return NULL if no errors have occurred.  If errors exist in the transaction,
the following table will be emitted.
+--------------------------------------+----------+------------------------------------------------+
| record_uuid                          | trans_id | code                                           |
+--------------------------------------+----------+------------------------------------------------+
| 666bfbbe-48d4-435e-997b-238a48760a1a | HEV39508 | POSTING_JOURNAL.ERRORS.UNBALANCED_TRANSACTIONS |
+--------------------------------------+----------+------------------------------------------------+

USAGE: CALL TrialBalanceErrors()
*/
CREATE PROCEDURE TrialBalanceErrors()
BEGIN

  -- this will hold our error cases
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_trial_balance_errors (
    record_uuid BINARY(16),
    trans_id TEXT,
    error_description TEXT,
    code TEXT
  );

  -- check if dates are in the correct period
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), CONCAT(pj.trans_id, ' : ', pj.trans_date) as error_description, 'POSTING_JOURNAL.ERRORS.DATE_IN_WRONG_PERIOD' AS code
    FROM posting_journal AS pj
      JOIN stage_trial_balance_transaction AS temp ON pj.record_uuid = temp.record_uuid
      JOIN period AS p ON pj.period_id = p.id
    WHERE DATE(pj.trans_date) NOT BETWEEN DATE(p.start_date) AND DATE(p.end_date)
    GROUP BY pj.record_uuid;

  -- check to make sure that the fiscal year is not closed
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), fiscal_year.label as error_description,'POSTING_JOURNAL.ERRORS.CLOSED_FISCAL_YEAR' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
      JOIN fiscal_year ON pj.fiscal_year_id = fiscal_year.id
    WHERE fiscal_year.locked <> 0
    GROUP BY pj.record_uuid;

  -- check to make sure that all lines of a transaction have a description
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), pj.trans_id as error_description, 'POSTING_JOURNAL.ERRORS.MISSING_DESCRIPTION' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    WHERE pj.description IS NULL
    GROUP BY pj.record_uuid;

  -- check that all periods are unlocked
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), CONCAT(p.start_date, ' ', p.end_date) as error_description, 'POSTING_JOURNAL.ERRORS.LOCKED_PERIOD' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN period p ON pj.period_id = p.id
    WHERE p.locked = 1 GROUP BY pj.record_uuid;

  -- check that there are no transactions with accounts of locked creditor groups
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), cg.name as error_description, 'POSTING_JOURNAL.ERRORS.LOCKED_CREDITOR_GROUP_ACCOUNT' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN creditor_group cg ON pj.account_id = cg.account_id
    WHERE cg.locked = 1 GROUP BY pj.record_uuid;

  -- check that there are no transactions with accounts of locked debtor groups
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), dg.name as error_description, 'POSTING_JOURNAL.ERRORS.LOCKED_DEBTOR_GROUP_ACCOUNT' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN debtor_group dg ON pj.account_id = dg.account_id
    WHERE dg.locked = 1 GROUP BY pj.record_uuid;

  -- check that all accounts are unlocked
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), CONCAT(a.number,' - ', a.label) as error_description, 'POSTING_JOURNAL.ERRORS.LOCKED_ACCOUNT' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN account a ON pj.account_id = a.id
    WHERE a.locked = 1 GROUP BY pj.record_uuid;

  -- check that users are active (no deactivated users)
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), u.display_name as error_description, 'POSTING_JOURNAL.ERRORS.DEACTIVATED_USER' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN user u ON pj.user_id = u.id
    WHERE u.deactivated = 1 GROUP BY pj.record_uuid;

  -- check that all transactions are balanced
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), pj.trans_id as error_description, 'POSTING_JOURNAL.ERRORS.UNBALANCED_TRANSACTIONS' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    GROUP BY pj.record_uuid
    HAVING ROUND(SUM(pj.debit_equiv), 2) <> ROUND(SUM(pj.credit_equiv), 2);

  -- check that all transactions have two or more lines
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, MAX(pj.trans_id), pj.trans_id as error_description, 'POSTING_JOURNAL.ERRORS.SINGLE_LINE_TRANSACTION' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    GROUP BY pj.record_uuid
    HAVING COUNT(pj.record_uuid) < 2;

  SELECT DISTINCT BUID(record_uuid) AS record_uuid, trans_id, error_description, code FROM stage_trial_balance_errors ORDER BY code, trans_id;
END $$

/*
CALL TrialBalanceSummary()

DESCRIPTION
This stored procedure produces the traditional Trial Balance table showing the account balances for any affected accounts
prior to the balance (`balance_before`), the debits to the accounts (`debit_equiv`), the credits to the accounts
(`credit_equiv`), and the proposed balances at the end of the operation (`balance_final`).  It should be used before
posting to the General Ledger to ensure that all transactions are correctly processed.

To use this method, a Trial Balance must first be _staged_.  The application expects that the record_uuids of all
transactions are already placed in the stage_trial_balance_transaction table via a call to
StageTrialBalanceTransaction().

SAMPLE OUTPUT
Running this a table with the following type:
+------------+--------+----------------------+----------------+-------------+--------------+----------------+
| account_id | number | label                | balance_before | debit_equiv | credit_equiv | balance_final  |
+------------+--------+----------------------+----------------+-------------+--------------+----------------+
|       3880 | 411900 | Patients Payant Cash | -22554880.0000 |  12250.0000 |   29100.0000 | -22571730.0000 |
|       3734 | 570001 | Petite Caisse (FC)   |   3331350.0000 |  29100.0000 |       0.0000 |   3360450.0000 |
|       3704 | 700100 | Pharmacie d’usage    |  -2516075.0000 |  17250.0000 |       0.0000 |  -2498825.0000 |
|       3886 | 700102 | Medicaments          | -23284054.9000 |      0.0000 |   29000.0000 | -23313054.9000 |
|       3887 | 700201 | Fiches               |   -497600.0000 |      0.0000 |     500.0000 |   -498100.0000 |
+------------+--------+----------------------+----------------+-------------+--------------+----------------+


USAGE: CALL TrialBalanceSummary()
*/
--
DROP PROCEDURE IF EXISTS TrialBalanceSummary$$
CREATE PROCEDURE TrialBalanceSummary()
BEGIN
  -- this assumes lines have been staged using CALL StageTrialBalanceTransaction()

  -- fiscal year to limit period_total search
  DECLARE fiscalYearId MEDIUMINT;

  -- get the fiscal year of the oldest record to limit period_total search
  SET fiscalYearId = (
    SELECT MIN(fiscal_year_id)
    FROM posting_journal JOIN stage_trial_balance_transaction
      ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid
  );

  -- gather the staged accounts
  CREATE TEMPORARY TABLE IF NOT EXISTS staged_accounts AS
    SELECT DISTINCT account_id FROM posting_journal JOIN stage_trial_balance_transaction
    ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid;

  -- gather the beginning period_totals
  CREATE TEMPORARY TABLE before_totals AS
    SELECT u.account_id, IFNULL(SUM(totals.debit - totals.credit), 0) AS balance_before
    FROM staged_accounts as u
    LEFT JOIN (
      SELECT account_id, debit, credit FROM period_total
      WHERE period_total.fiscal_year_id = fiscalYearId
    ) totals ON u.account_id = totals.account_id
    GROUP BY u.account_id;

  SELECT account_id, account.number AS number, account.label AS label, account.type_id,
    balance_before, debit_equiv, credit_equiv,
    balance_before + debit_equiv - credit_equiv AS balance_final
  FROM (
    SELECT posting_journal.account_id, MAX(totals.balance_before) AS balance_before, SUM(debit_equiv) AS debit_equiv,
      SUM(credit_equiv) AS credit_equiv
    FROM posting_journal JOIN before_totals as totals
    ON posting_journal.account_id = totals.account_id
    WHERE posting_journal.record_uuid IN (
      SELECT record_uuid FROM stage_trial_balance_transaction
    ) GROUP BY posting_journal.account_id
  ) AS combined
  JOIN account ON account.id = combined.account_id
  ORDER BY account.number;
END $$

/*
PostToGeneralLedger()

This procedure uses the same staging code as the Trial Balance to stage and then post transactions
from the posting_journal table to the General Ledger table.

*/
CREATE PROCEDURE PostToGeneralLedger()
BEGIN

  DECLARE isInvoice, isCash, isVoucher INT;

  -- write into the posting journal
  INSERT INTO general_ledger (
    project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id
  ) SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date, posting_journal.record_uuid,
    description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
    entity_uuid, reference_uuid, comment, transaction_type_id, user_id
  FROM posting_journal JOIN stage_trial_balance_transaction AS staged
    ON posting_journal.record_uuid = staged.record_uuid;

  -- write into period_total
  INSERT INTO period_total (
    account_id, credit, debit, fiscal_year_id, enterprise_id, period_id
  )
  SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit,
    fiscal_year_id, project.enterprise_id, period_id
  FROM posting_journal JOIN stage_trial_balance_transaction JOIN project
    ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid
    AND project_id = project.id
  GROUP BY fiscal_year_id, period_id, account_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- remove from posting journal
  DELETE FROM posting_journal WHERE record_uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  -- Let specify that this invoice or the cash payment is posted
  SELECT COUNT(uuid) INTO isInvoice  FROM invoice  WHERE invoice.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isCash  FROM cash  WHERE cash.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isVoucher  FROM voucher  WHERE voucher.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  IF isInvoice > 0 THEN
    UPDATE invoice SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

  IF isCash > 0 THEN
    UPDATE cash SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

  IF isVoucher > 0 THEN
    UPDATE voucher SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

END $$

DELIMITER ;
DELIMITER $$
/*

--------
OVERVIEW
--------

This procedures file contains all procedures for creating vouchers.  A "voucher"
is a generic accounting document that can model essentially any transaction.
Given their flexibility, they are expected to be a user's main method of
creating non-standard transactions, such as recording generic payments or
balancing accounts.  All transactions that are not an invoice or cash payment
are modeled as vouchers.

Unlike cash payments and invoices, where many additional calculations may need
to take place prior to writing the transaction, vouchers alone have no
additional preprocessing.  For this reason, they are missing the StageVoucher()
and StageVoucherItem() methods.  The tables can be written to directly from JS.

There is also a special facility for reversing transactions.  In double-entry
accounting, to reverse a transaction, one only needs to flip the debits and
credits of a previous transaction.  However, this does not capture the reason
for which the transaction needed to be reversed.  To overcome this limitation,
BHIMA implements ReverseTransaction(), which adds special text to the previous
transaction's description, as well as points the voucher's "reference_uuid"
column to the reversed transaction.  Despite a similar sounding name, the
"reference_uuid" column is never written to the posting_journal.  It is used
only for reference lookups on the voucher table.
*/


/*
CALL PostVoucher();

DESCRIPTION
This function posts a voucher that has already been written to the vouchers
table.  The route will convert currencies from the given currency into the
enterprise currency directly as it writes the values into the posting_journal.
*/
CREATE PROCEDURE PostVoucher(
  IN uuid BINARY(16)
)
BEGIN
  DECLARE enterprise_id INT;
  DECLARE project_id INT;
  DECLARE currency_id INT;
  DECLARE date TIMESTAMP;

  -- variables to store core set-up results
  DECLARE fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;


  DECLARE transIdNumberPart INT;
  --
  SELECT p.enterprise_id, p.id, v.currency_id, v.date
    INTO enterprise_id, project_id, currency_id, date
  FROM voucher AS v JOIN project AS p ON v.project_id = p.id
  WHERE v.uuid = uuid;

  -- populate core setup values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, fiscal_year_id, period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  -- make sure the exchange rate is correct
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate));

  SET transIdNumberPart = GetTransactionNumberPart(transaction_id, project_id);

  -- POST to the posting journal
  -- @TODO(sfount) transaction ID number reference should be fetched seperately from full transaction ID to model this relationship better
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_id_reference_number, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    reference_uuid, comment, transaction_type_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, transIdNumberPart, v.date,
    v.uuid, v.description, vi.account_id, vi.debit, vi.credit,
    vi.debit * (1 / current_exchange_rate), vi.credit * (1 / current_exchange_rate), v.currency_id,
    vi.entity_uuid, vi.document_uuid, NULL, v.type_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$

/*
CALL ReverseTransaction()

DESCRIPTION
A unique procedure specifically for reversing cash payments or invoices.  It
should not be called for vouchers.  The procedures will simply copy the previous
transaction and create a voucher reversing the debits and credits of the
transaction.  In double-entry accounting, this will effectively annul the last
transaction.  Additionally, the voucher will store the uuid of the record that
is being reversed in the "reference_uuid" column of the "voucher" table.  This
enables filters to look up the reversing entry later for any cash payment or
invoice.

Once the procedure has finished, the corresponding cash or invoice record will
have the "reversed" column set to "1".
*/
CREATE PROCEDURE ReverseTransaction(
  IN uuid BINARY(16),
  IN user_id INT,
  IN description TEXT,
  IN voucher_uuid BINARY(16),
  IN preserveDate BOOLEAN /* use the original transaction date */
)
BEGIN
  -- NOTE: someone should check that the record_uuid is not used as a reference_uuid somewhere
  -- This is done in JS currently, but could be done here.
  DECLARE isInvoice BOOLEAN;
  DECLARE isCashPayment BOOLEAN;
  DECLARE isVoucher BOOLEAN;
  DECLARE reversalType INT;
  DECLARE oldDate TIMESTAMP;

  SET reversalType = 10;

  SET isInvoice = (SELECT IFNULL((SELECT 1 FROM invoice WHERE invoice.uuid = uuid), 0));
  SET isVoucher = (SELECT IFNULL((SELECT 1 FROM voucher WHERE voucher.uuid = uuid), 0));

  -- avoid a scan of the cash table if we already know this is an invoice reversal
  IF NOT isInvoice THEN
    SET isCashPayment = (SELECT IFNULL((SELECT 1 FROM cash WHERE cash.uuid = uuid), 0));
  END IF;

  -- set old date
  IF preserveDate THEN
    IF isInvoice THEN
      SET oldDate = (SELECT date FROM invoice WHERE invoice.uuid = uuid);
    ELSEIF isVoucher THEN
      SET oldDate = (SELECT date FROM voucher WHERE voucher.uuid = uuid);
    ELSE
      SET oldDate = (SELECT date FROM cash WHERE cash.uuid = uuid);
    END IF;
  ELSE
    set oldDate = (SELECT NOW());
  END IF;

  -- @fixme - why do we have `amount` in the voucher table?

  INSERT INTO voucher (uuid, date, project_id, currency_id, amount, description, user_id, type_id, reference_uuid)
    SELECT voucher_uuid, oldDate, zz.project_id, enterprise.currency_id, 0, CONCAT_WS(' ', '(CORRECTION)', description), user_id, reversalType, uuid
    FROM (
      SELECT pj.project_id, pj.description FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION ALL
      SELECT gl.project_id, gl.description FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz
      JOIN project ON zz.project_id = project.id
      JOIN enterprise ON project.enterprise_id = enterprise.id
    LIMIT 1;

  -- NOTE: the debits and credits are swapped on purpose here
  INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid)
    SELECT HUID(UUID()), zz.account_id, zz.credit_equiv, zz.debit_equiv, voucher_uuid, zz.reference_uuid, zz.entity_uuid
    FROM (
      SELECT pj.account_id, pj.credit_equiv, pj.debit_equiv, pj.reference_uuid, pj.entity_uuid
      FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION ALL
      SELECT gl.account_id, gl.credit_equiv, gl.debit_equiv, gl.reference_uuid, gl.entity_uuid
      FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz;

  -- update the "amount" with the sum of the voucher_items.  We could choose either
  -- debits or credits to sum here ... they should be equivalent.
  UPDATE voucher SET amount = (
    SELECT SUM(vi.debit) FROM (
      SELECT * FROM voucher_item) AS vi WHERE vi.voucher_uuid = voucher.uuid
    ) WHERE voucher.uuid = voucher_uuid;

  -- make sure we update the invoice with the fact that it got reversed.
  IF isInvoice THEN
    UPDATE invoice SET reversed = 1 WHERE invoice.uuid = uuid;
  END IF;

  -- make sure we update the cash payment that was reversed
  IF isCashPayment THEN
    UPDATE cash SET reversed = 1 WHERE cash.uuid = uuid;
  END IF;

  IF isVoucher THEN
    UPDATE voucher SET reversed = 1 where voucher.uuid = uuid;
  END IF;

  CALL PostVoucher(voucher_uuid);
END $$

/*

CALL UndoEntityReversal

DESCRIPTION:
Reset the reversed = 1 flag if an entity has been incorrectly reversed or an
operation that depends on reversal has failed

@TODO(sfount) A generic function for either setting or un-setting this flag would
              be preferred - new financial entities would have to be added to both
              this function and to ReverseTransaction
*/
CREATE PROCEDURE UndoEntityReversal(
  IN uuid BINARY(16)
)
BEGIN
  DECLARE isInvoice BOOLEAN;
  DECLARE isCashPayment BOOLEAN;
  DECLARE isVoucher BOOLEAN;

  SET isInvoice = (SELECT IFNULL((SELECT 1 FROM invoice WHERE invoice.uuid = uuid), 0));
  SET isVoucher = (SELECT IFNULL((SELECT 1 FROM voucher WHERE voucher.uuid = uuid), 0));

  -- avoid a scan of the cash table if we already know this is an invoice reversal
  IF NOT isInvoice THEN
    SET isCashPayment = (SELECT IFNULL((SELECT 1 FROM cash WHERE cash.uuid = uuid), 0));
  END IF;

  IF isInvoice THEN
    UPDATE invoice SET reversed = 0 WHERE invoice.uuid = uuid;
  END IF;

  -- make sure we update the cash payment that was reversed
  IF isCashPayment THEN
    UPDATE cash SET reversed = 0 WHERE cash.uuid = uuid;
  END IF;

  IF isVoucher THEN
    UPDATE voucher SET reversed = 0 where voucher.uuid = uuid;
  END IF;
END $$

DELIMITER ;
DELIMITER $$

/*
 zRecomputeEntityMap

 Abolishes and recomputes the entity_map from the base tables in the system.  This is
 useful in case of database corruption in which references get out of sync.
*/
CREATE PROCEDURE zRecomputeEntityMap()
BEGIN
  DELETE FROM entity_map;

  -- patient
  INSERT INTO entity_map
    SELECT patient.uuid, CONCAT_WS('.', 'PA', project.abbr, patient.reference)
    FROM patient JOIN project ON patient.project_id = project.id;

  -- patient debtor
  INSERT INTO entity_map
    SELECT patient.debtor_uuid, CONCAT_WS('.', 'PA', project.abbr, patient.reference)
    FROM patient JOIN project ON patient.project_id = project.id;

  -- employee
  INSERT INTO entity_map
    SELECT employee.creditor_uuid, CONCAT_WS('.', 'EM', enterprise.abbr, employee.reference)
    FROM employee
    JOIN patient ON patient.uuid = employee.patient_uuid
    JOIN project ON project.id = patient.project_id
    JOIN enterprise ON enterprise.id = project.enterprise_id;

  -- supplier
  INSERT INTO entity_map
    SELECT supplier.creditor_uuid, CONCAT_WS('.', 'FO', supplier.reference) FROM supplier;
END $$

/*
 zRecomputeDocumentMap

 Abolishes and recomputes the document_map entries from the base tables in the
 database.  This is useful in case of data corruption.
*/
CREATE PROCEDURE zRecomputeDocumentMap()
BEGIN
  DELETE FROM document_map;

  -- cash payments
  INSERT INTO document_map
    SELECT cash.uuid, CONCAT_WS('.', 'CP', project.abbr, cash.reference)
    FROM cash JOIN project where project.id = cash.project_id;

  -- invoices
  INSERT INTO document_map
    SELECT invoice.uuid, CONCAT_WS('.', 'IV', project.abbr, invoice.reference)
    FROM invoice JOIN project where project.id = invoice.project_id;

  -- purchases
  INSERT INTO document_map
    SELECT purchase.uuid, CONCAT_WS('.', 'PO', project.abbr, purchase.reference)
    FROM purchase JOIN project where project.id = purchase.project_id;

  -- vouchers
  INSERT INTO document_map
    SELECT voucher.uuid, CONCAT_WS('.', 'VO', project.abbr, voucher.reference)
    FROM voucher JOIN project where project.id = voucher.project_id;

  -- stock movements
  INSERT INTO `document_map`
    SELECT sm.document_uuid, CONCAT_WS('.', 'SM', sm.flux_id, sm.reference)
    FROM stock_movement sm
    ON DUPLICATE KEY UPDATE uuid = sm.document_uuid;
END $$

/*
 zRepostVoucher

 Removes the voucher record from the posting_journal and calls the PostVoucher() method on
 the record in the voucher table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostVoucher(
  IN vUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = vUuid;
  CALL PostVoucher(vUuid);
END $$

/*
 zRepostInvoice

 Removes the invoice record from the posting_journal and calls the PostInvoice() method on
 the record in the invoice table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostInvoice(
  IN iUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = iUuid;
  CALL PostInvoice(iUuid);
END $$

/*
 zRepostCash

 Removes the cash record from the posting_journal and calls the PostCash() method on
 the record in the cash table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostCash(
  IN cUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = cUuid;
  CALL VerifyCashTemporaryTables();
  CALL PostCash(cUuid);
END $$

/*
 zRecalculatePeriodTotals

 Removes all data from the period_total table and rebuilds it.
*/
CREATE PROCEDURE zRecalculatePeriodTotals()
BEGIN

  -- wipe the period total table
  DELETE FROM  period_total
  WHERE period_id IN (
    SELECT id
    FROM period
    WHERE number <> 0
  );

  INSERT INTO period_total (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
    SELECT project.enterprise_id, period.fiscal_year_id, period_id, account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) AS debit
    FROM general_ledger
      JOIN period ON general_ledger.period_id = period.id
      JOIN project ON general_ledger.project_id = project.id
    GROUP BY account_id, period_id, fiscal_year_id, enterprise_id;

END $$


CREATE PROCEDURE zUpdatePatientText()
BEGIN
  UPDATE `debtor` JOIN `patient` ON debtor.uuid = patient.debtor_uuid
    SET debtor.text = CONCAT('Patient/', patient.display_name);
END $$

/*
CALL zMergeServices(fromId, toId);

DESCRIPTION
Merges two services by changing the service_id pointers to the new service and
then removing the previous service.
*/
DROP PROCEDURE IF EXISTS zMergeServices$$
CREATE PROCEDURE zMergeServices(
  IN from_service_id INTEGER,
  IN to_service_id INTEGER
) BEGIN

  UPDATE invoice SET service_id = to_service_id WHERE service_id = from_service_id;
  UPDATE employee SET service_id = to_service_id WHERE service_id = from_service_id;
  UPDATE patient_visit_service SET service_id = to_service_id WHERE service_id = from_service_id;
  UPDATE ward SET service_id = to_service_id WHERE service_id = from_service_id;
  UPDATE service_fee_center SET service_id = to_service_id WHERE service_id = from_service_id;
  UPDATE indicator SET service_id = to_service_id WHERE service_id = from_service_id;
  DELETE FROM service WHERE id = from_service_id;
END $$

/*
CALL zMergeAccounts(fromId, toId);

DESCRIPTION
Merges two accounts by changing the account_id pointers to the new account and removing
the old one.  NOTE - you must call zRecalculatePeriodTotals() when all done with these
operations.  It isn't called here to allow operations to be batched for performance, then
committed.
*/
DROP PROCEDURE IF EXISTS zMergeAccounts $$
CREATE PROCEDURE zMergeAccounts(
  IN from_account_number TEXT,
  IN to_account_number TEXT
) BEGIN
  DECLARE from_account_id MEDIUMINT;
  DECLARE to_account_id MEDIUMINT;

  SET from_account_id = (SELECT id FROM account WHERE number = from_account_number);
  SET to_account_id = (SELECT id FROM account WHERE number = to_account_number);

  UPDATE general_ledger SET account_id = to_account_id WHERE account_id = from_account_id;
  UPDATE posting_journal SET account_id = to_account_id WHERE account_id = from_account_id;
  UPDATE voucher_item SET account_id = to_account_id WHERE account_id = from_account_id;
  DELETE FROM period_total where account_id = from_account_id;
  DELETE FROM account WHERE id = from_account_id;
END $$

DELIMITER ;

