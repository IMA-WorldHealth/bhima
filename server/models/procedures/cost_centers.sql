DELIMITER $$
/*
  This file contains code for linking cost centers to various activities throughout the app.
*/


/*
@function GetCostCenterByAccountId()

@description
Retrieves the cost center id for an account by using its account_id. Each account should
have one and only one cost center.  If an account does not have a cost center, NULL will be
returned.

NOTE(@jniles) - Currently, BHIMA does not guarantee that only one cost center is associated with an
account, but when we do make guarantees, we will be able to modify this function to do it.
*/
DROP FUNCTION IF EXISTS GetCostCenterByAccountId$$
CREATE FUNCTION GetCostCenterByAccountId(account_id INT)
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM account WHERE account.id = account_id
  );
END $$

/*
@function GetPrincipalCostCenterByAccountId()

@description
Retrieves the principal center id for an account by using its account_id. Each account should
have one and only one cost center.  If an account does not have a principal center, NULL will be
returned.

NOTE(@jniles) - Currently, BHIMA does not guarantee that only one cost center is associated with an
account, but when we do make guarantees, we will be able to modify this function to do it.
*/
DROP FUNCTION IF EXISTS GetPrincipalCostCenterByAccountId$$
CREATE FUNCTION GetPrincipalCostCenterByAccountId(account_id INT)
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM account
      JOIN cost_center ON account.cost_center_id = cost_center.id
    WHERE account.id = account_id AND cost_center.is_principal = 1
  );
END $$

/*
@function GetCostCenterByServiceUuid()

@description
Retrieves the cost center id for a service using its service_uuid.  Each service should have one
and only one cost center assocaited with it.  If a service does not have a cost center, NULL will
be returned.

NOTE(@jniles) - Currently, BHIMA does not guarantee that only one cost center is associated with a
service, but when we do make guarantees, we will be able to modify this function to do it.
*/
DROP FUNCTION IF EXISTS GetCostCenterByServiceUuid$$
CREATE FUNCTION GetCostCenterByServiceUuid(service_uuid BINARY(16))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT cost_center_id FROM service_cost_center
    WHERE service_cost_center.service_uuid = service_uuid
  );
END $$

/*
@function GetCostCenterByInvoiceUuid(invoice_uuid)

@params invoice_uuid BINARY(16) the invoice uuid

@description
Returns the cost center id for the invoice using the service_uuid in the invoice table
*/
DROP FUNCTION IF EXISTS GetCostCenterByInvoiceUuid$$
CREATE FUNCTION GetCostCenterByInvoiceUuid(invoice_uuid BINARY(16))
RETURNS MEDIUMINT(8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT GetCostCenterByServiceUuid(i.service_uuid)
    FROM invoice i
    WHERE i.uuid = invoice_uuid
  );
END $$


DROP PROCEDURE IF EXISTS ComputeCostCenterAllocationByIndex$$
CREATE PROCEDURE ComputeCostCenterAllocationByIndex(
  IN _dateFrom DATE,
  IN _dateTo DATE,
  IN _useRevenue BOOLEAN,
  IN _currencyId TINYINT
)
BEGIN
  DECLARE _enterpriseId SMALLINT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
      SET @full_error = CONCAT("ERROR ", @errno, " (", @sqlstate, "): ", @text);
      SELECT @full_error AS error_message;
    END;

  SET _enterpriseId = (SELECT id FROM enterprise LIMIT 1);

  SET _useRevenue = (SELECT IF(_useRevenue, 1, 0));

  DROP TEMPORARY TABLE IF EXISTS cost_center_costs_with_indexes;
  CREATE TEMPORARY TABLE cost_center_costs_with_indexes AS
    SELECT
      z.id, z.label AS cost_center_label,
      z.allocation_basis_id,
      z.is_principal,
      z.step_order,
      SUM(z.`value` * IFNULL(GetExchangeRate(_enterpriseId, _currencyId, _dateTo), 1)) AS direct_cost,
      ccb.name AS cost_center_allocation_basis_label,
      ccbv.quantity AS cost_center_allocation_basis_value
    FROM
    (
        (
          SELECT
            fc.id, fc.label, fc.is_principal, fc.step_order, ccb.name AS allocation_basis_id,
            SUM(cca.debit - cca.credit) AS `value`
          FROM cost_center AS fc
          JOIN cost_center_aggregate cca ON cca.principal_center_id = fc.id
          JOIN `period` p ON p.id = cca.period_id
          LEFT JOIN cost_center_allocation_basis ccb ON ccb.id = fc.allocation_basis_id
          WHERE DATE(p.start_date) >= DATE(_dateFrom) AND DATE(p.end_date) <= DATE(_dateTo) 
            AND cca.is_income = _useRevenue
          GROUP BY cca.principal_center_id
        )
        UNION ALL
        (
          SELECT
            fc.id, fc.label, fc.is_principal, fc.step_order, ccb.name AS allocation_basis_id,
            SUM(cca.debit - cca.credit) AS `value`
          FROM cost_center AS fc
          JOIN cost_center_aggregate cca ON cca.cost_center_id = fc.id AND cca.principal_center_id IS NULL
          JOIN `period` p ON p.id = cca.period_id
          LEFT JOIN cost_center_allocation_basis ccb ON ccb.id = fc.allocation_basis_id
          WHERE DATE(p.start_date) >= DATE(_dateFrom) AND DATE(p.end_date) <= DATE(_dateTo) 
            AND cca.is_income = _useRevenue
          GROUP BY cca.cost_center_id
        )
    ) AS z
    JOIN cost_center_allocation_basis_value ccbv ON ccbv.cost_center_id = z.id
    JOIN cost_center_allocation_basis ccb ON ccb.id = ccbv.basis_id
    GROUP BY z.id, ccb.name 
    ORDER by z.step_order ASC;

  SELECT
    GROUP_CONCAT(DISTINCT
      CONCAT(
        'MAX(CASE WHEN cost_center_allocation_basis_label = ''',
        cost_center_allocation_basis_label,
        ''' then cost_center_allocation_basis_value end) AS `',
        cost_center_allocation_basis_label, '`'
      )
    ) INTO @sql
  FROM cost_center_costs_with_indexes;

  SET @sql = CONCAT('SELECT id, cost_center_label, is_principal, step_order, direct_cost, allocation_basis_id, ', @sql, ' FROM cost_center_costs_with_indexes GROUP BY id');

  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

END$$

DELIMITER ;
