DELIMITER $$

DROP PROCEDURE IF EXISTS ComputeCostCenterAllocationByIndex$$
CREATE PROCEDURE ComputeCostCenterAllocationByIndex(
  IN _dateFrom DATE,
  IN _dateTo DATE
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE,
        @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
      SET @full_error = CONCAT("ERROR ", @errno, " (", @sqlstate, "): ", @text);
      SELECT @full_error AS error_message;
    END;


  DROP TEMPORARY TABLE IF EXISTS cost_center_costs_with_indexes;
  CREATE TEMPORARY TABLE cost_center_costs_with_indexes AS
    SELECT
        z.id, z.label AS cost_center_label,
        z.allocation_basis_id,
        z.is_principal,
        z.step_order,
        z.`value` AS direct_cost,
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
          GROUP BY cca.principal_center_id
        )
        UNION DISTINCT
        (
          SELECT
            fc.id, fc.label, fc.is_principal, fc.step_order, ccb.name AS allocation_basis_id,
            SUM(cca.debit - cca.credit) AS `value`
          FROM cost_center AS fc
          JOIN cost_center_aggregate cca ON cca.cost_center_id = fc.id AND cca.principal_center_id IS NULL
          JOIN `period` p ON p.id = cca.period_id
          LEFT JOIN cost_center_allocation_basis ccb ON ccb.id = fc.allocation_basis_id
          WHERE DATE(p.start_date) >= DATE(_dateFrom) AND DATE(p.end_date) <= DATE(_dateTo)
          GROUP BY cca.cost_center_id
        )
    ) AS z
    JOIN cost_center_allocation_basis_value ccbv ON ccbv.cost_center_id = z.id
    JOIN cost_center_allocation_basis ccb ON ccb.id = ccbv.basis_id
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
